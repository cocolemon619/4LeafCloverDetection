"use client";

import { useState } from "react";

export default function HomePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);  // ← 追加

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // 検出結果は新しい画像選択時はクリアしても良いかも
      setResultImage(null);
      setCount(null);
      setPredictions([]);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    setLoading(true); // ここでローディング開始

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch("http://localhost:8000/detect/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResultImage(`data:image/jpeg;base64,${data.base64_image}`);
        setCount(data.count);
        setPredictions(data.predictions);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Fetch error: " + error);
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">4-Leaf Clover Detection</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-4"
        disabled={loading} // ローディング中はボタン無効化
      >
        {loading ? "推論中..." : "Upload & Detect"}
      </button>

      {previewUrl && (
        <div className="mt-4">
          <p className="font-semibold">Preview:</p>
          <img src={previewUrl} alt="Preview" className="w-96 mt-2" />
        </div>
      )}

      {resultImage && (
        <div className="mt-6">
          <p className="font-semibold">Detection Result:</p>
          <img src={resultImage} alt="Result" className="w-96 mt-2 border" />
          <p className="mt-2">Detected Objects: {count}</p>

          <ul className="mt-2">
            {predictions.map((p, i) => (
              <li key={i}>
                <strong>{p.class}</strong> - Confidence:{" "}
                {(p.confidence * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
