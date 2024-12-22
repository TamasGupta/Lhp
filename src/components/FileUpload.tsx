import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type FileuploadProps = {
isFileuploaded: (check: boolean)=> void
};
export const FileUpload: React.FC<FileuploadProps>=({isFileuploaded})=> {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setUploading(true);
      const file = uploadFile;
      console.log(file);
      if (!file) return;

      // Validate file type
      const fileType = file.type;
      if (!fileType.startsWith("image/") && fileType !== "application/pdf") {
        toast.error("Only images and PDFs are allowed");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      const fileName = `${Date.now()}-${title}`;
      const { error } = await supabase.storage
        .from("files")
        .upload(fileName, file);

      if (error) throw error;

      // Create a record in the files table
      const { error: dbError } = await supabase.from("files").insert([
        {
          name: title,
          path: fileName,
          type: fileType,
          size: file.size,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("File uploaded successfully!");
      isFileuploaded(true)

    setTitle("")
    setUploadFile(null)

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleFileUpload} className="  relative">
       <ul className="background">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      <div className=" fileForm sm:flex width-full justify-around p-20  z-40 text-white ">
       
        <div className="flex flex-col md:gap-10 mb-5  z-40">
          <h1 className="text-2xl font-[caveat] md:text-5xl">
            You Can Also Contribute,
          </h1>
          <h1 className="text-2xl font-[caveat] md:text-5xl">
            By Just Sharing,
          </h1>
          <h1 className="text-4xl font-[caveat] md:text-5xl">
            Question Papers Or Question Bank PDFs
          </h1>
        </div>
        <div className="w-full max-w-md shadow-md  flex flex-col gap-5 z-40 bg-slate-100 p-5 rounded-xl bg-opacity-10">
          <label className="flex  flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
            <div className="flex items-center gap-2">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
              {!uploadFile ? (
                <span className="text-base">
                  {uploading ? "Uploading..." : "Upload a file"}
                </span>
              ) : (
                <span>{uploadFile.name}</span>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUploadFile(e.target.files ? e.target.files[0] : null)
              }
              disabled={uploading}
            />
          </label>

          <label className="" id="title">
            <input
              className="block w-full px-4 py-2 text-gray-700 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              type="text"
              placeholder="Title..."
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <button
            className="bg-cyan-400 rounded-full text-white p-2"
            type="submit"
          >
            Upload File
          </button>
        </div>
      </div>
    </form>
  );
}
