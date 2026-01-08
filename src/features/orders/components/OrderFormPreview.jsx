import { forwardRef } from "react"
import { SIZE_TYPE, CUSTOMIZATION_TYPE } from "@/constants/orderConstants"
import { getMeasurementCategoryById } from "@/constants/measurementCategories"

/**
 * OrderFormPreview - Printable/Downloadable Order Form
 * This component renders a print-friendly order form that can be
 * downloaded as PDF using browser's print function
 */
const OrderFormPreview = forwardRef(({ order, item, formData }, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const isCustomSize = item?.sizeType === SIZE_TYPE.CUSTOM

  return (
    <div ref={ref} className="bg-white p-8 max-w-3xl mx-auto text-sm print:text-xs">
      {/* Add this right after the opening <div ref={ref}> to debug */}
      <pre className="text-xs bg-yellow-100 p-2 mb-4">
        includedItems: {JSON.stringify(item?.includedItems)}
        selectedAddOns: {JSON.stringify(item?.selectedAddOns)}
      </pre>
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">ORDER CONFIRMATION FORM</h1>
        <p className="text-slate-600 mt-1">Please review and confirm all details below</p>
      </div>

      {/* Basic Information */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">1. Basic Information</h2>
        <div className="grid grid-cols-2 gap-4 px-3">
          <div>
            <span className="text-slate-500">Order No:</span>
            <span className="ml-2 font-medium">{order?.orderNumber || "—"}</span>
          </div>
          <div>
            <span className="text-slate-500">Form Generated:</span>
            <span className="ml-2 font-medium">{today}</span>
          </div>
          <div>
            <span className="text-slate-500">FWD Date:</span>
            <span className="ml-2 font-medium">{formatDate(order?.fwdDate)}</span>
          </div>
          <div>
            <span className="text-slate-500">Expected Ship Date:</span>
            <span className="ml-2 font-medium">{formatDate(order?.productionShippingDate)}</span>
          </div>
        </div>
      </section>

      {/* Client Information */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">2. Client Information</h2>
        <div className="grid grid-cols-2 gap-4 px-3">
          <div>
            <span className="text-slate-500">Client Name:</span>
            <span className="ml-2 font-medium">{order?.customerName || "—"}</span>
          </div>
          <div>
            <span className="text-slate-500">Height:</span>
            <span className="ml-2 font-medium">{order?.clientHeight || "—"}</span>
          </div>
          <div>
            <span className="text-slate-500">Consultant:</span>
            <span className="ml-2 font-medium">{order?.consultantName || "—"}</span>
          </div>
          <div>
            <span className="text-slate-500">Location:</span>
            <span className="ml-2 font-medium">{order?.destination || "—"}</span>
          </div>
        </div>
      </section>

      {/* Product Information */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">
          3. Product Information
        </h2>
        <div className="px-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500">Product:</span>
              <span className="ml-2 font-medium">{item?.productName || "—"}</span>
            </div>
            <div>
              <span className="text-slate-500">SKU:</span>
              <span className="ml-2 font-medium">{item?.productSku || "—"}</span>
            </div>
            <div>
              <span className="text-slate-500">Size:</span>
              <span className="ml-2 font-medium">
                {item?.size || "—"}
                {isCustomSize && " (Custom)"}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Quantity:</span>
              <span className="ml-2 font-medium">{item?.quantity || 1}</span>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">What's Included</h2>
        <div className="px-3 grid grid-cols-2 gap-4">
          <div>
            <span className="text-slate-500">Included Items:</span>
            {item?.includedItems && item.includedItems.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.includedItems.map((included, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded capitalize"
                  >
                    {included.piece}
                  </span>
                ))}
              </div>
            ) : (
              <span className="ml-2 text-slate-400">None</span>
            )}
          </div>
          <div>
            <span className="text-slate-500">Add-ons:</span>
            {item?.selectedAddOns && item.selectedAddOns.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.selectedAddOns.map((addon, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded capitalize"
                  >
                    {addon.piece}
                  </span>
                ))}
              </div>
            ) : (
              <span className="ml-2 text-slate-400">None</span>
            )}
          </div>
        </div>
      </section>

      {/* Customizations */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">4. Customizations</h2>
        <div className="px-3 space-y-4">
          {/* Style */}
          <div>
            <span className="font-medium">Style: </span>
            {formData?.style?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
              <div className="mt-2 pl-4 border-l-2 border-slate-300">
                {formData.style.details?.top && (
                  <p>
                    <span className="text-slate-500">Top:</span> {formData.style.details.top}
                  </p>
                )}
                {formData.style.details?.bottom && (
                  <p>
                    <span className="text-slate-500">Bottom:</span> {formData.style.details.bottom}
                  </p>
                )}
                {formData.style.details?.dupattaShawl && (
                  <p>
                    <span className="text-slate-500">Dupatta/Shawl:</span>{" "}
                    {formData.style.details.dupattaShawl}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-slate-600">Original (No customization)</span>
            )}
          </div>

          {/* Color */}
          <div>
            <span className="font-medium">Color: </span>
            {formData?.color?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
              <span>{formData.color.details}</span>
            ) : (
              <span className="text-slate-600">Original</span>
            )}
          </div>

          {/* Fabric */}
          <div>
            <span className="font-medium">Fabric: </span>
            {formData?.fabric?.type === CUSTOMIZATION_TYPE.CUSTOMIZED ? (
              <span>{formData.fabric.details}</span>
            ) : (
              <span className="text-slate-600">Original</span>
            )}
          </div>
        </div>
      </section>

      {/* Measurements */}
      {isCustomSize && formData?.measurementCategories?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">
            5. Custom Measurements (inches)
          </h2>
          <div className="px-3">
            {formData.measurementCategories.map((catId) => {
              const category = getMeasurementCategoryById(catId)
              if (!category) return null
              return (
                <div key={catId} className="mb-4">
                  <h3 className="font-medium text-slate-700 mb-2">{category.name}</h3>
                  {category.groups.map((group) => (
                    <div key={group.name} className="mb-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">{group.name}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {group.measurements.map((m) => {
                          const value = formData.measurements?.[m.id]
                          if (!value) return null
                          return (
                            <div key={m.id} className="text-xs">
                              <span className="text-slate-500">{m.label}:</span>
                              <span className="ml-1 font-medium">{value}"</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Shipping Details */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold bg-slate-100 px-3 py-2 mb-3">6. Shipping Details</h2>
        <div className="px-3 space-y-2">
          <div>
            <span className="text-slate-500">Country:</span>
            <span className="ml-2 font-medium">{order?.destination || "—"}</span>
          </div>
          <div>
            <span className="text-slate-500">Full Address:</span>
            <span className="ml-2 font-medium">{order?.address || "—"}</span>
          </div>
        </div>
      </section>

      {/* Approval Section */}
      <section className="mt-8 pt-6 border-t-2 border-slate-300">
        <p className="text-center text-slate-600 mb-6">
          Please confirm that all the above details are correct. If you have any changes, please
          contact your consultant immediately.
        </p>
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <p className="text-slate-500 mb-8">Customer Signature:</p>
            <div className="border-b border-slate-400"></div>
          </div>
          <div>
            <p className="text-slate-500 mb-8">Date:</p>
            <div className="border-b border-slate-400"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-slate-500">
        <p>Thank you for your order!</p>
        <p>This is a computer-generated document.</p>
      </div>
    </div>
  )
})

OrderFormPreview.displayName = "OrderFormPreview"

export default OrderFormPreview
