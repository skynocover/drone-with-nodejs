# CI/CD

> https://medium.com/starbugs/從零開始學-devops-那就選擇最簡單的-drone-ci-開始吧-931126671139

> https://blog.wu-boy.com/2019/04/cicd-drone-1-0-feature/

## ngrok

> https://dashboard.ngrok.com

### intall

```
sudo snap install ngrok
```

[intall link](https://snapcraft.io/install/ngrok/ubuntu)

### forwarding

> ngrok http 8081

得到網址

```
Session Status                online
Account                       EricWu (Plan: Free)
Version                       2.3.35
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://524c5b23a4f8.ngrok.io -> http://localhost:80
Forwarding                    https://524c5b23a4f8.ngrok.io -> http://localhost:80

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### connect

```
ngrok authtoken 1ndC6jZveOOtfz0TzEFFdiNBuzM_EuRAumdYrAt117huUoFr
```

## github

> https://github.com/settings/applications/new

### 建立新的 OAuth

- Homepage URL http://524c5b23a4f8.ngrok.io
- Authorization callback URL http://524c5b23a4f8.ngrok.io/login

### 產生 Client secrets

並記錄

## drone

> https://www.drone.io

## install

```
curl -L https://github.com/drone/drone-cli/releases/latest/download/drone_linux_amd64.tar.gz | tar zx

sudo install -t /usr/local/bin drone
```

```
$ drone info
User: stu60610
Email: stu60610@gmail.com
```

- docker-compose.yml

```yaml
version: "3"

services:
  drone-server:
    image: drone/drone:latest #指定server為drone最新版
    ports:
      - 8081:80
    volumes:
      - ./:/data
    restart: always
    environment:
      - DRONE_SERVER_HOST=${DRONE_SERVER_HOST} #Drone server url 填寫在.env檔案中
      - DRONE_SERVER_PROTO=${DRONE_SERVER_PROTO} #Drone server protocol 填寫在.env檔案中
      - DRONE_RPC_SECRET=${DRONE_RPC_SECRET} #自定義隨機碼，填寫在.env檔案中
      - DRONE_AGENTS_ENABLED=true
      # Github Config
      - DRONE_GITHUB_CLIENT_ID=${DRONE_GITHUB_CLIENT_ID} #github client ID，填寫在.env檔案中
      - DRONE_GITHUB_CLIENT_SECRET=${DRONE_GITHUB_CLIENT_SECRET} #github client secret，填寫在.env檔案中
  drone-agent:
    image: drone/drone-runner-docker:latest
    ports:
      - 3000:3000
    restart: always
    depends_on:
      - drone-server
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DRONE_RPC_PROTO=http
      - DRONE_RPC_HOST=drone-server
      - DRONE_RPC_SECRET=${DRONE_RPC_SECRET}
      - DRONE_RUNNER_NAME=${DRONE_HOSTNAME} #自訂host name 填寫在.env檔案中
      - DRONE_RUNNER_CAPACITY=2
```

- env

```
DRONE_SERVER_HOST=524c5b23a4f8.ngrok.io
DRONE_SERVER_PROTO=http
DRONE_RPC_SECRET=gEY6Ys1knt3fJnAsda
DRONE_GITHUB_CLIENT_ID=4292f3927a2166d960c9
DRONE_GITHUB_CLIENT_SECRET=97106a15a3929c8b79d5cce7cae4261f535d4c69
DRONE_HOSTNAME=test_host
```

- DRONE_SERVER_HOST ngrok 給的 host 或 ip port (不需要 http://)
- DRONE_RPC_SECRET 自定義亂數
- DRONE_GITHUB_CLIENT_ID
- DRONE_GITHUB_CLIENT_SECRET
- DRONE_HOSTNAME

## 佈署

> 針對每一個 repo 前往網址進行 active 並 SAVE

- .drone.yml

```yaml
kind: pipeline
type: docker #在docker環境中執行
name: test #自定義pipleline名稱

steps: #工作列表
  - name: build-nginx-image #自訂工作名稱
    pull: if-not-exists #要不要pull指定的image
    image: plugins/docker #指定要拿來執行command的image或者plugin
    commands:
      - docker build -t webman2 .
    when: # 當觸發條件為 master 分支時會執行的動作
      branch:
        - master
    settings:
      registry: registry.hub.docker.com #dockerhub registry url
      repo: registry.hub.docker.com/skynocover/guandacontactman #打包完要上傳的docker repo名稱
      dockerfile: dockerfile #根據指定的Docker file打包image
      auto_tag: true #自動下tag
      username: #dockerhub user name
        from_secret: hubname
      password: #dockerhub password
        from_secret: hubsecret
```

## secret

> drone secret -h

```
NAME:
   drone secret - manage secrets

USAGE:
   drone secret command [command options] [arguments...]

COMMANDS:
     add     adds a secret
     rm      remove a secret
     update  update a secret
     info    display secret info
     ls      list secrets

OPTIONS:
   --help, -h  show help
```

新增 secret 並綁定 image 及 repository

```
drone secret add \
  --name ssh-password \
  --data 1234567890 \
  --image appleboy/drone-ssh \
  --repository go-training/drone-workshop
```

新增檔案

@後面為檔案路徑

```
drone secret add \
  --name ssh-key \
  --data @/etc/server.pem \
  --image appleboy/drone-ssh \
  --repository go-training/drone-workshop
```

## P.S.

> github 目標 repo >settings >Webhooks

檢查 url 是否正確
