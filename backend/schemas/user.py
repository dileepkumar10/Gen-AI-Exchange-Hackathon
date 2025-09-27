from pydantic import BaseModel

class UserCreate(BaseModel):
    # id: int
    username: str
    email: str
    full_name: str | None = None
    # disabled: bool | None = None
    # username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str