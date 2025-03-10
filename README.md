[//]: # "header"
<h1 align="center">RepitCode - Coding for Fun</h1>

[//]: # "le tech stack"
<div align="center">
   <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
   <img src="https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</div>


[//]: # "catch"
<p align="center">
   A web app to get you into the groove and track what you'd want to learn within the field of software engineering.
</p>

## Why was this made? 🤔💭
* I myself sometimes lose sight of what I would want to continue learning throughout my semesters at university, so having an application track the progress and information of the skills I want to uplevel would be handy!
* Allowing others to get into the groove of learning software engineering via spaced repetition, consistent practice, and an application to keep them responsbile would be highly fulfilling NGL!

## Screenshots of the application! 😲🚀

## How do I run this locally? 💚🙂
> [!NOTE]\
> This program is fully hosted right now via localhost and packages by a Docker container! In the future, this likely will be moved to GCP because UIUC gave me free credits LOL
>
> Click -> [here](https://docs.docker.com/desktop/install/windows-install/) to go to the installation page.

With Docker Desktop installed and opened, you can run these commands at the root directory of this GitHub repo...
```shell
# if you are running this for the first time, or have made changes and want to see it take affect on its deployment, use this
docker compose up -d --build
# starts the application in its detached state
docker compose up -d
# turns off the application
docker compose down
# wipes the container clean, effectively deleting the volumes for the database
docker compose down -v
```

## Get in touch 💬
If you liked what you saw, feel free to contact me! email: emoral435@gmail.com

[Star Logs 🚀](https://starlogs.dev/emoral435/RepetiCode)
