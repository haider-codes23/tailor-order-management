import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useOrder, useUpdateOrder } from "@/hooks/useOrders"
import { useUsers } from "@/hooks/useUsers"
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
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  CURRENCIES,
  PAYMENT_METHODS,
  URGENT_FLAGS,
  HEIGHT_RANGES,
} from "@/constants/orderConstants"

export default function EditOrderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: order, isLoading: orderLoading } = useOrder(id)
  const { data: usersData } = useUsers()
  const updateOrder = useUpdateOrder()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm({
    values: order
      ? {
          customerName: order.customerName || "",
          destination: order.destination || "",
          address: order.address || "",
          clientHeight: order.clientHeight || "",
          modesty: order.modesty || "",
          consultantId: order.consultantId || "",
          productionInchargeId: order.productionInchargeId || "",
          currency: order.currency || "",
          paymentMethod: order.paymentMethod || "",
          totalAmount: order.totalAmount || "",
          fwdDate: order.fwdDate ? order.fwdDate.split("T")[0] : "",
          productionShippingDate: order.productionShippingDate
            ? order.productionShippingDate.split("T")[0]
            : "",
          actualShippingDate: order.actualShippingDate
            ? order.actualShippingDate.split("T")[0]
            : "",
          preTrackingId: order.preTrackingId || "",
          urgent: order.urgent || "",
          notes: order.notes || "",
          orderFormLink: order.orderFormLink || "",
        }
      : undefined,
  })

  // Populate form when order data loads

  const users = usersData?.data || []
  const salesUsers = users.filter((u) => u.role === "SALES" || u.role === "ADMIN")
  const productionUsers = users.filter((u) => u.role === "PRODUCTION_HEAD" || u.role === "ADMIN")

  const onSubmit = async (data) => {
    try {
      await updateOrder.mutateAsync({
        orderId: id,
        data: {
          ...data,
          totalAmount: parseFloat(data.totalAmount) || 0,
        },
      })
      toast.success("Order updated successfully")
      navigate(`/orders/${id}`)
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <p>Order not found</p>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Order</h1>
          <p className="text-muted-foreground">Order #{order.orderNumber}</p>
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
                <p className="text-sm text-red-500 mt-1">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <Label>Destination (Country)</Label>
              <Input {...register("destination")} placeholder="e.g., UAE, USA, UK" />
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

        {/* Team Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Team Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Fashion Consultant (Sales Person)</Label>
              <Controller
                name="consultantId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value?.toString()} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Production Incharge</Label>
              <Controller
                name="productionInchargeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value?.toString()} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select production incharge" />
                    </SelectTrigger>
                    <SelectContent>
                      {productionUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
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
              <Input type="number" step="0.01" {...register("totalAmount")} placeholder="0.00" />
            </div>
          </CardContent>
        </Card>

        {/* Dates & Shipping */}
        <Card>
          <CardHeader>
            <CardTitle>Dates & Shipping</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>FWD Date (Confirmed)</Label>
              <Input type="date" {...register("fwdDate")} />
            </div>

            <div>
              <Label>Production Shipping Date</Label>
              <Input type="date" {...register("productionShippingDate")} />
            </div>

            <div>
              <Label>Actual Shipping Date</Label>
              <Input type="date" {...register("actualShippingDate")} />
            </div>

            <div>
              <Label>Tracking ID</Label>
              <Input {...register("preTrackingId")} placeholder="Courier tracking number" />
            </div>

            <div>
              <Label>Order Form Link</Label>
              <Input {...register("orderFormLink")} placeholder="Google Drive link" />
            </div>
          </CardContent>
        </Card>

        {/* Status & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Notes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Urgent Flag</Label>
              <Controller
                name="urgent"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                  >
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

            <div className="md:col-span-2">
              <Label>Internal Notes</Label>
              <Textarea
                {...register("notes")}
                placeholder="Add any internal notes or instructions"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isDirty || updateOrder.isPending}>
            {updateOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
