import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { APIConfigPanel } from "@/components/upload/APIConfigPanel";
import { DataPreviewTable } from "@/components/upload/DataPreviewTable";

export default function UploadPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload & Source</h1>
        <p className="text-muted-foreground mt-1">
          Import your review data and configure API settings
        </p>
      </div>

      <FileUploadZone />
      <DataPreviewTable />
      <APIConfigPanel />
    </div>
  );
}
