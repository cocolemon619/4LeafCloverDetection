import os
import uuid
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient

# .envファイル読み込み
load_dotenv()

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 一時保存ディレクトリの作成
TEMP_DIR = "tmp"
os.makedirs(TEMP_DIR, exist_ok=True)

client = InferenceHTTPClient(
    api_url=os.getenv("API_URL"),
    api_key=os.getenv("API_KEY")
)

@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    try:
        # 一時ファイル保存
        temp_filename = f"{uuid.uuid4().hex}.jpg"
        temp_path = os.path.join(TEMP_DIR, temp_filename)

        with open(temp_path, "wb") as f:
            f.write(await file.read())

        # ワークフロー実行
        result = client.run_workflow(
            workspace_name="373lover",
            workflow_id="detect-count-and-visualize",
            images={"image": temp_path},
            use_cache=True
        )

        # ファイル削除
        os.remove(temp_path)

        response_data = {
            "count": result[0]["count_objects"],
            "base64_image": result[0]["output_image"],
            "predictions": result[0]["predictions"]["predictions"]
        }
        return JSONResponse(content=response_data)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
