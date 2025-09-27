@echo off
echo Creating new branch 'aiincluded' and pushing code...

git add .
git commit -m "Add AI-powered backend integration with GROQ LLM, authentication, and professional PDF export"
git checkout -b aiincluded
git push -u origin aiincluded

echo.
echo Branch 'aiincluded' created and pushed successfully!
echo.
pause