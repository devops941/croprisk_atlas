from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UploadErrorItem(BaseModel):
    row_index: int
    field_name: Optional[str] = None
    invalid_value: Optional[str] = None
    rejection_reason: str

    class Config:
        from_attributes = True

class UploadBatchResponse(BaseModel):
    id: int
    file_name: str
    batch_type: str
    total_records: int
    accepted_records: int
    rejected_records: int
    data_provenance: str
    uploaded_at: datetime
    errors: List[UploadErrorItem] = []

    class Config:
        from_attributes = True

class UploadSummary(BaseModel):
    batch_id: int
    status: str
    total_rows: int
    valid_rows: int
    rejected_rows: int
    errors: List[UploadErrorItem] = []
