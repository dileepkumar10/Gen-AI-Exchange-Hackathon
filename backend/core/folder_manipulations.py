import os
from pathlib import Path, PurePath
import shutil


def create_directory_if_not_exists(dir_path: str):
    Path(dir_path).mkdir(parents=True, exist_ok=True)