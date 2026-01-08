import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

export default function ImageUploader({ 
  value, 
  onChange, 
  label = "Upload Image",
  className = "" 
}) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(value || null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      onChange(objectUrl)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {preview ? (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Upload preview" 
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-32 h-32 border-dashed flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center px-1">{label}</span>
        </Button>
      )}
    </div>
  )
}