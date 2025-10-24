import os

from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

from dotenv import load_dotenv

load_dotenv()



file_path = r"C:\sharath\Github\SaaS\AI Startup Analyst\backend\assets\Seth123\AI_Wealth_Concierge_Pitch.pdf"

class DocumentParserAndLoader:

    def __init__(self, username, file_path, embeddings, VECTOR_DB_PATH, chunk_size=1024, chunk_overlap=100):
        self.username = username
        self.file_path = file_path
        self.embeddings = embeddings
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.vector_db_path = VECTOR_DB_PATH + self.username

    def read_document(self):
        """Read document based on file extension"""
        file_ext = os.path.splitext(self.file_path)[1].lower()
        
        if file_ext == '.pdf':
            loader = PyPDFLoader(self.file_path)
        elif file_ext in ['.doc', '.docx']:
            loader = Docx2txtLoader(self.file_path)
        elif file_ext == '.txt':
            loader = TextLoader(self.file_path, encoding='utf-8')
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
            
        self.docs = loader.load()

    def split_data(self):

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=[
                "\n\n",
                "\n",
                " ",
                ".",
                ",",
                "\u200b",  # Zero-width space
                "\uff0c",  # Fullwidth comma
                "\u3001",  # Ideographic comma
                "\uff0e",  # Fullwidth full stop
                "\u3002",  # Ideographic full stop
                "",
            ],
        )

        self.split_docs = text_splitter.split_documents(self.docs)
        

    def store_docs_in_vector_db(self):
        vector_store = FAISS.from_documents(self.split_docs, self.embeddings)
        vector_store.save_local(self.vector_db_path)
        

    def load_vector_db(self):
        self.vector_db = FAISS.load_local(
            self.vector_db_path, 
            self.embeddings, 
            allow_dangerous_deserialization=True
        )
    

# d_obj = DocumentParserAndLoader(
#     username="Seth123", file_path=file_path, embeddings=embeddings, chunk_size=1024, chunk_overlap=100
# )

# d_obj.read_pdf()
# d_obj.split_data()
# d_obj.store_docs_in_vector_db()
# d_obj.load_vector_db()

# print(len(d_obj.split_docs))