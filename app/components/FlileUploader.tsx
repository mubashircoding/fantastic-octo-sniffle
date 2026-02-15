import { useCallback, useState } from "react";
import { formatize } from "~/lib/format";
import { useDropzone } from "react-dropzone";
interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
}

const FlileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
    },
    [onFileSelect],
  );
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxSize: 20 * 1024 * 1024,
    });
  const file = acceptedFiles[0] || null;

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img
              src="/public/icons/info.svg"
              alt="upload"
              className="size-20"
            />
          </div>
          {file ? (
            <div className="flex items-center space-x-3">
              <img src="/public/images/pdf.png" alt="pdf" className="size-10" />
              <div className="">
                <p className="text-sm text-gray-700 font-medium truncate">
                  {file.name}
                </p>

                <br />
                <span className="text-gray-500">{formatize(file.size)}</span>
              </div>
            </div>
          ) : (
            <div className="">
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-lg text-gray-500">PDF max size 20MB</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlileUploader;
