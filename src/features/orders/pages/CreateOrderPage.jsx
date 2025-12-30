import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useCreateOrder } from "@/hooks/useOrders"
import { useProducts } from "@/hooks/useProducts"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import {
  CURRENCIES,
  PAYMENT_METHODS,
  URGENT_FLAGS,
  HEIGHT_RANGES,
  SIZE_TYPE,
  STANDARD_SIZES,
} from "@/constants/orderConstants"

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createOrder = useCreateOrder()
  const { data: productsData } = useProducts()

  const products = productsData?.data || []

  // Order items state
  const [orderItems, setOrderItems] = useState([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    productName: "",
    sizeType: SIZE_TYPE.STANDARD,
    size: "",
    quantity: 1,
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: "",
      destination: "",
      address: "",
      clientHeight: "",
      modesty: "NO",
      consultantId: user?.id?.toString() || "",
      consultantName: user?.name || "",
      currency: "USD",
      paymentMethod: "",
      totalAmount: "",
      fwdDate: "",
      productionShippingDate: "",
      urgent: "none",
      notes: "",
    },
  })

  // Handle adding item
  const handleAddItem = () => {
    setCurrentItem({
      productId: "",
      productName: "",
      sizeType: SIZE_TYPE.STANDARD,
      size: "",
      quantity: 1,
    })
    setShowItemModal(true)
  }

  // Handle saving item
  const handleSaveItem = () => {
    if (!currentItem.productId) {
      toast.error("Please select a product")
      return
    }
    if (!currentItem.size) {
      toast.error("Please select a size")
      return
    }

    const selectedProduct = products.find(
      (p) => p.id.toString() === currentItem.productId
    )

    setOrderItems([
      ...orderItems,
      {
        ...currentItem,
        id: Date.now(),
        productName: selectedProduct?.name || "",
        productImage: selectedProduct?.image || "",
      },
    ])
    setShowItemModal(false)
  }

  // Handle removing item
  const handleRemoveItem = (itemId) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  // Form submission
  const onSubmit = async (data) => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    try {
      const orderData = {
        ...data,
        urgent: data.urgent === "none" ? "" : data.urgent,
        totalAmount: parseFloat(data.totalAmount) || 0,
        items: orderItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          sizeType: item.sizeType,
          size: item.size,
          quantity: item.quantity,
        })),
      }

      await createOrder.mutateAsync(orderData)
      toast.success("Order created successfully")
      navigate("/orders")
    } catch (error) {
      toast.error("Failed to create order")
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Order</h1>
          <p className="text-muted-foreground">
            Add a new manual order to the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                {...register("customerName", {
                  required: "Customer name is required",
                })}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div>
              <Label>Destination (Country)</Label>
              <Input
                {...register("destination")}
                placeholder="e.g., UAE, USA, UK"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Full Address</Label>
              <Textarea
                {...register("address")}
                placeholder="Enter complete shipping address"
                rows={2}
              />
            </div>

            <div>
              <Label>Client Height</Label>
              <Controller
                name="clientHeight"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select height range" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEIGHT_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Modesty Requirement</Label>
              <Controller
                name="modesty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Yes</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Currency</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Total Amount</Label>
              <Input
                type="number"
                step="0.01"
                {...register("totalAmount")}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dates & Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Priority</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>FWD Date (Confirmed)</Label>
              <Input type="date" {...register("fwdDate")} />
            </div>

            <div>
              <Label>Production Shipping Date</Label>
              <Input type="date" {...register("productionShippingDate")} />
            </div>

            <div>
              <Label>Urgent Flag</Label>
              <Controller
                name="urgent"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Not urgent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Urgent</SelectItem>
                      {URGENT_FLAGS.map((flag) => (
                        <SelectItem key={flag.value} value={flag.value}>
                          {flag.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="md:col-span-3">
              <Label>Internal Notes</Label>
              <Textarea
                {...register("notes")}
                placeholder="Add any internal notes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" onClick={handleAddItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No items added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size} | Type:{" "}
                          {item.sizeType === SIZE_TYPE.STANDARD
                            ? "Standard"
                            : "Custom"}{" "}
                          | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Add Item Modal */}
      <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Order Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Product *</Label>
              <Select
                value={currentItem.productId}
                onValueChange={(value) => {
                  const product = products.find(
                    (p) => p.id.toString() === value
                  )
                  setCurrentItem({
                    ...currentItem,
                    productId: value,
                    productName: product?.name || "",
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id.toString()}
                    >
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Size Type</Label>
              <Select
                value={currentItem.sizeType}
                onValueChange={(value) =>
                  setCurrentItem({
                    ...currentItem,
                    sizeType: value,
                    size: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIZE_TYPE.STANDARD}>
                    Standard Size
                  </SelectItem>
                  <SelectItem value={SIZE_TYPE.CUSTOM}>Custom Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Size *</Label>
              {currentItem.sizeType === SIZE_TYPE.STANDARD ? (
                <Select
                  value={currentItem.size}
                  onValueChange={(value) =>
                    setCurrentItem({ ...currentItem, size: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARD_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={currentItem.size}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, size: e.target.value })
                  }
                  placeholder="Enter custom size label"
                />
              )}
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}