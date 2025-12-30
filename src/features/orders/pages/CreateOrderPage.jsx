import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useCreateOrder } from "@/hooks/useOrders"
import { useProducts } from "@/hooks/useProducts"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  CURRENCIES,
  PAYMENT_METHODS,
  URGENT_TYPE,
  SIZE_TYPE,
  STANDARD_SIZES,
  HEIGHT_RANGES,
} from "@/constants/orderConstants"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  AlertTriangle,
} from "lucide-react"

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const createOrder = useCreateOrder()
  const { data: productsData } = useProducts()

  const products = productsData?.data || []

  // Order items state
  const [orderItems, setOrderItems] = useState([])
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedSizeType, setSelectedSizeType] = useState(SIZE_TYPE.STANDARD)
  const [selectedSize, setSelectedSize] = useState("")

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: "",
      destination: "",
      address: "",
      clientHeight: "",
      modesty: "NO",
      currency: "USD",
      paymentMethod: "paypal",
      totalAmount: "",
      fwdDate: new Date().toISOString().split("T")[0],
      productionShippingDate: "",
      urgent: "",
      notes: "",
    },
  })

  // Add item to order
  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Please select a product")
      return
    }
    if (selectedSizeType === SIZE_TYPE.STANDARD && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    const newItem = {
      tempId: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.image,
      productSku: selectedProduct.sku,
      sizeType: selectedSizeType,
      size: selectedSizeType === SIZE_TYPE.CUSTOM ? "Custom" : selectedSize,
      quantity: 1,
    }

    setOrderItems((prev) => [...prev, newItem])
    setItemModalOpen(false)
    setSelectedProduct(null)
    setSelectedSizeType(SIZE_TYPE.STANDARD)
    setSelectedSize("")
  }

  // Remove item from order
  const removeItem = (tempId) => {
    setOrderItems((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  // Handle form submission
  const onSubmit = (data) => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    const orderData = {
      ...data,
      totalAmount: parseFloat(data.totalAmount) || 0,
      consultantId: user?.id,
      consultantName: user?.name,
      items: orderItems.map(({ tempId, ...item }) => item),
    }

    createOrder.mutate(orderData, {
      onSuccess: (newOrder) => {
        toast.success("Order created successfully")
        navigate(`/orders/${newOrder.id}`)
      },
      onError: () => {
        toast.error("Failed to create order")
      },
    })
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create New Order</h1>
          <p className="text-sm text-slate-500">Manually create a customer order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Customer Name *</Label>
              <Input
                {...register("customerName", { required: "Customer name is required" })}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">{errors.customerName.message}</p>
              )}
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
              <Label>Destination Country *</Label>
              <Input
                {...register("destination", { required: "Destination is required" })}
                placeholder="e.g., United Arab Emirates"
              />
              {errors.destination && (
                <p className="text-sm text-red-500 mt-1">{errors.destination.message}</p>
              )}
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
            <div className="sm:col-span-2">
              <Label>Full Address *</Label>
              <Textarea
                {...register("address", { required: "Address is required" })}
                placeholder="Enter complete shipping address"
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items ({orderItems.length})
            </h3>
            <Button type="button" size="sm" onClick={() => setItemModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Package className="h-12 w-12 mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500">No items added yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setItemModalOpen(true)}
              >
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.tempId}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      {item.size}
                      {item.sizeType === SIZE_TYPE.CUSTOM && (
                        <span className="text-amber-600"> (Custom)</span>
                      )}
                      {" • "}SKU: {item.productSku}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.tempId)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment & Dates */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment & Dates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <SelectValue />
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
                {...register("totalAmount")}
                placeholder="0"
              />
            </div>
            <div>
              <Label>FWD Date</Label>
              <Input type="date" {...register("fwdDate")} />
            </div>
            <div>
              <Label>Production Ship Date</Label>
              <Input type="date" {...register("productionShippingDate")} />
            </div>
            <div>
              <Label>Urgent</Label>
              <Controller
                name="urgent"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Not urgent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Urgent</SelectItem>
                      <SelectItem value={URGENT_TYPE.EVENT}>Event</SelectItem>
                      <SelectItem value={URGENT_TYPE.RTS}>RTS</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Notes</h3>
          <Textarea
            {...register("notes")}
            placeholder="Add internal notes or special instructions..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/orders")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Order
          </Button>
        </div>
      </form>

      {/* Add Item Modal */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Order Item</DialogTitle>
            <DialogDescription>Select a product and size to add to this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Product *</Label>
              <Select
                value={selectedProduct?.id || ""}
                onValueChange={(id) => setSelectedProduct(products.find((p) => p.id === id))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Size Type *</Label>
              <Select value={selectedSizeType} onValueChange={setSelectedSizeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIZE_TYPE.STANDARD}>Standard Size</SelectItem>
                  <SelectItem value={SIZE_TYPE.CUSTOM}>Custom Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedSizeType === SIZE_TYPE.STANDARD && (
              <div>
                <Label>Size *</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARD_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSizeType === SIZE_TYPE.CUSTOM && (
              <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Custom measurements will be entered when generating the order form.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}