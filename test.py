from inference_sdk import InferenceHTTPClient

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="CMpzQnxH5ranl9a4eNvY"
)

result = CLIENT.infer("C:/Users/rikutotomita/pythonTest/20250524practice/IMG_20240430_125556.jpg", model_id="4-leaf-clover-detect/1")


print(result)
