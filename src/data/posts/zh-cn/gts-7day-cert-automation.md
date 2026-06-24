---
title: 猎奇向：如何自动化地签发与轮替 Google Trust Services 的 7 日证书
description: 本文讲述如何自动化地使用 acme.sh 签发 GTS 的 7 日有效期证书，并通过阿里云 CLI 更新至 ESA。
date: "2026-06-25T01:00:00+08:00"
tags:
  - Google Trust Services
  - acme.sh
  - 阿里云
category: 技术
canonicalUrl: https://blog.licaoz.com/post/gts-7day-cert-automation/
---

> [!TIP] 灵感来源
>
> [使用 GitHub Actions 自动申请与部署 ACME SSL 证书](https://blog.men.ci/ssl-with-github-actions/) by Menci

## 前情提要

近几日主播将博客和 jsd 加速等面向中国大陆的基础设施由腾讯云 CDN 迁移到了阿里云 ESA<small>（其实就是阿里云版的腾讯云 Edge One。如果你感兴趣的话，可以走我的 [邀请链接](https://dashi.aliyun.com/activity/esa?clubTaskBiz=subTask..12710007..10270..&userCode=ft0svigz) 试一试）</small>，总体体验还不错（尽管 ESA 的操作逻辑一股浓郁的 Cloudflare 味？）

由于 licaoz.com 的 DNS 服务使用 DNSPod，因此，在腾讯云时期，腾讯云证书托管功能有权通过 DNSPod 直接添加 DNS 类型的 challenge 记录，并在证书签发成功后重新同步回腾讯云 CDN 服务。尽管阿里云 ESA 依旧提供免费证书自动化续期与托管 DCV 能力，但免费证书仅限 10 张 Let's Encrypt 与 1 张 DigiCert Encryption Everywhere 单域名证书。本人个人不太喜欢 ISRG 根，并且依旧刻板地认为它的兼容性不如 GTS；而 DigiCert 那个又只支持单域名、还仅限一条。因此，使用 [acme.sh](https://github.com/acmesh-official/acme.sh) 来申请一个 GTS 证书就很符合我的折腾尿性。  
而又因为我印象中很久很久之前我见过或是 [@renbaoshuo](https://baoshuo.ren/) 或是 [@menci](https://men.ci) 发过类似的文章，在 Google 上简单搜索了一下翻到了 [使用 GitHub Actions 自动申请与部署 ACME SSL 证书](https://blog.men.ci/ssl-with-github-actions/)。

## 环境安装与 ACME 账户凭据生成

### 安装 acme.sh

如果你喜欢 curl（或者单纯就是环境里没 wget 又懒得装），那么可以运行下面这行命令***（所有花括号 `{}` 均表示变量，需在运行前按描述修改。所有变量均无需键入花括号本身。下同）***：

```bash
curl https://get.acme.sh | sh -s email={替换为你的邮箱，例如 email=pki@zaochih.com}
```

对于访问 GitHub 存在困难的中国大陆用户，可使用以下替代方式：

```bash
curl https://jsd.licaoz.com/gh/zaochih/get.acme.sh@master/index.sh | sh -s email={替换为你的邮箱，例如 email=pki@zaochih.com}
```

> [!note]
>
> 你可以在 [https://github.com/zaochih/get.acme.sh/](https://github.com/zaochih/get.acme.sh/) 审计本脚本，或仅运行 `curl https://jsd.licaoz.com/gh/zaochih/get.acme.sh@master/index.sh` 来检查本文件除 [更改了脚本中的 shell 程序链接](https://github.com/zaochih/get.acme.sh/blob/f53aca11f87ab67168986e29bf8ec8efbac58bac/index.sh#L33) 外再无任何其他可疑更改。

如果你倾向于使用 wget，则可以使用：

```bash
wget -O -  https://get.acme.sh | sh -s email={替换为你的邮箱，例如 email=pki@zaochih.com}
```

同样的，对于中国大陆用户，可使用：

```bash
wget -O -  https://jsd.licaoz.com/gh/zaochih/get.acme.sh@master/index.sh | sh -s email={替换为你的邮箱，例如 email=pki@zaochih.com}
```

### 获取 GCP 的 EAB 凭据

完成本步骤需要你拥有一个 Google 账号和一个能够访问 Google 账户服务及 Google Cloud Platform 的网络环境。若还没有 Google 账号，你可前往 [这里](https://accounts.google.com/SignUp?continue=https://myaccount.google.com) 注册。

你需要先前往 [此处](https://console.cloud.google.com/projectcreate?organizationId=0) 新建一个项目。记得保留下图红框里的 Project ID，后面要用；如果你看不顺眼系统自动生成的，也可以点击旁边的 Edit 编辑一个。

![Google Cloud Platform 的“新建项目”页面的屏幕截图，框住了“Project ID”字段。](/assets/images/2026/gcp-new-project.png)

创建好 project 后，选中它，找到屏幕右上角的那个长得像终端一样的图标。如果你正在使用拥有键盘的设备，也可以先后按下 <kbd>G</kbd> 和 <kbd>S</kbd> 键以打开 Cloud Shell。

如果一切正常，你应该能看到如下的消息：

```bash
Welcome to Cloud Shell! Type "help" to get started, or type "gemini" to try prompting with Gemini CLI.
Your Cloud Platform project in this session is set to gts-certificates.
Use `gcloud config set project [PROJECT_ID]` to change to a different project.
zaochih@cloudshell:~ (gts-certificates)$
```

其中，`gts-certificates` 应该是你刚才创建的项目 ID。如果没有项目相关信息，你可以通过运行 `gcloud config set project [PROJECT_ID]` 来切换到那个项目。

打开 Cloud Shell 后，分别运行下面三个命令：

```bash
# 给自己授权
gcloud projects add-iam-policy-binding {刚才记下的 Project ID} \
  --member=user:{你刚才登录 GCP 的 Google 账号的邮箱} \
  --role=roles/publicca.externalAccountKeyCreator
```

```bash
# 启用 Public CA API
gcloud services enable publicca.googleapis.com
```

```bash
# 生成 EAB Key
gcloud publicca external-account-keys create
```

运行完最后一条命令后，你应该能得到类似这样的返回消息，请保留其中的 `b64MacKey` 和 `keyId` 字段内容：

![Google Cloud Platform 的 Cloud Shell 的屏幕截图，框住了“Created an external account key”。](/assets/images/2026/gcp-created-eak.png)

```shell
zaochih@cloudshell:~ (gts-certificates)$ gcloud publicca external-account-keys create
Created an external account key
[b64MacKey: 一串字母、数字、下划线组合而成的字符串
keyId: 一串字母和数字组合而成的字符串]
```

### 在本地注册 ACME 账户凭据

运行下面这条命令：

```bash
acme.sh --register-account \
  --server google \
  -m {你接收 CA 通知的邮箱；如果你刚才安装的时候没有省略 "-s email" 字段，则可以省略此处的 "-m"} \
  --eab-kid "{你的 keyId}" \
  --eab-hmac-key "{你的 b64MacKey}"
```

如果一切正常，你应该能得到以下的控制台输出：

```shell
[这里是时间] Account key creation OK.
[这里是时间] Registering account: https://dv.acme-v02.api.pki.goog/directory
[这里是时间] Registered
[这里是时间] ACCOUNT_THUMBPRINT='一串字母、数字、下划线组合而成的字符串'
```

此时 ACME 账户已经注册，凭据已经生成；该小节告一段落。

## 获取阿里云 RAM 子用户 AccessKey

前往 [阿里云 RAM 访问控制控制台](https://ram.console.aliyun.com/overview?activeTab=workflow)，切换到“快速开始”tab，在下方的“创建程序用户”中选择“用于程序访问的超级用户”。

![阿里云 RAM 访问控制控制台的屏幕截图，其中切换到了“快速开始”标签页，并高亮选中了“用于程序访问的超级用户”选项](/assets/images/2026/aliyun-ram-selector.png)

然后自定义一个你能看出来它是做什么的的登录名称（以后不会用到），例如 `esa-certificates-workflow`。然后点击 **执行配置**。你将被要求使用短信验证码或人脸识别核验身份。

![阿里云 RAM 访问控制控制台的屏幕截图，其中显示执行完成，并展示了 AccessKey ID 和 Secret](/assets/images/2026/aliyun-ram-created.png)

核验通过后，你将能够看到如上图所示的 AccessKey ID 和 Secret。请妥善暂存它们，我们将在之后的环节用到。

### 权限最小化

默认情况下，通过此预配选项创建的用户拥有管理账户下所有资源的权限，而这并不符合“权限最小化”原则。因此，我们可以前往 [用户页面](https://ram.console.aliyun.com/users)，找到该用户，点击用户名进入用户管理页面，切换到“权限管理”选项卡并移除系统自动授予的 PowerUserAccess 权限。而后，请点击“新增授权”，并授予该账户 `AliyunESAFullAccess` 权限。

> [!tip] 小贴士
>
> 如果你想进一步限定该账户的权限，可授予“资源组级别”权限而非“账号级别”。此处不再对分割资源组进行展开。

## 获取 DNSPod Token

前往 [https://console.dnspod.cn/account/token/token](https://console.dnspod.cn/account/token/token)，创建一个 DNSPod 密钥。暂存好 ID 和 Token 字段。

## 创建 GitHub 仓库与部署 GitHub Actions

前往 [https://github.com/new](https://github.com/new) 创建一个新私有仓库（除非你想公开你正在做什么），起一个你喜欢的名字。而后在 Actions tab 选择创建 Workflow → “Set up a workflow yourself →”。这会带你来到一个新页面。

默认情况下，新 workflow 的文件名是 `main.yml`。除非你的仓库是专门只为运行这个 workflow 而创建的，否则，我推荐你更改一个新的文件名，例如 `gts-certificates.yml`。

本脚本默认使用 DNSPod 域名解析服务，部署至阿里云 ESA；你也可以询问 AI，让其帮你改写为其他你正在使用的平台。

完整复制并将以下内容粘贴至该文件的输入框内。

```yml
name: Renew GTS Wildcard Certificate

on:
  schedule:
    - cron: '45 3 */5 * *'  # 每 5 天 03:45 UTC；你可以改为你喜欢的时间，其中第一个数字为分钟，第二个数字为小时
  workflow_dispatch:

env:
  DOMAIN: something.example   # ← 改成你的主域名

jobs:
  renew:
    runs-on: ubuntu-latest

    steps:
      # ── 1. 安装 acme.sh ──────────────────────────────────────
      - name: Install acme.sh
        run: curl https://get.acme.sh | sh -s email=${{ vars.ACME_EMAIL }}

      # ── 2. 还原 GTS 账号配置 ─────────────────────────────────
      - name: Restore GTS account config
        run: |
          echo "${{ secrets.ACME_ACCOUNT_B64 }}" | base64 -d \
            | tar xz -C ~/.acme.sh

      # ── 3. 签发 7 天泛域名证书 ───────────────────────────────
      - name: Issue certificate (7 days)
        env:
          DP_Id: ${{ secrets.DNSPOD_ID }}
          DP_Key: ${{ secrets.DNSPOD_KEY }}
        run: |
          ~/.acme.sh/acme.sh --issue \
            --dns dns_dp \
            -d "*.$DOMAIN" \
            -d "$DOMAIN" \
            --server google \
            --keylength ec-256 \
            --valid-to '+7d' \
            --force \
            --reloadcmd ""

      # ── 4. 安装阿里云 CLI ────────────────────────────────────
      - name: Install Aliyun CLI
        run: |
          curl -sL https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz \
            | tar xz -C /usr/local/bin aliyun
          aliyun configure set \
            --profile esa \
            --mode AK \
            --region cn-hangzhou \
            --access-key-id ${{ secrets.ALI_KEY }} \
            --access-key-secret ${{ secrets.ALI_SECRET }}

      # ── 5. 部署证书到 ESA ────────────────────────────────────
      - name: Deploy certificate to ESA
        run: |
          CERT_DIR=$(echo ~/.acme.sh/*.${DOMAIN}_ecc)
          CERT=$(cat ${CERT_DIR}/fullchain.cer)
          KEY=$(cat ${CERT_DIR}/*.${DOMAIN}.key)
          aliyun --profile esa esa SetCertificate \
            --SiteId "${{ vars.ESA_SITE_ID }}" \
            --Type upload \
            --Certificate "$CERT" \
            --PrivateKey "$KEY" \
            --Name "wildcard-$(date +%Y%m%d)"

      # ── 6. Bark 通知：成功 ───────────────────────────────────
      - name: Notify success
        if: success()
        run: |
          curl -s -X POST "https://api.day.app/${{ vars.BARK_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"title\": \"✅ 证书已更新\",
              \"body\": \"*.$DOMAIN 7天证书已签发并部署至 ESA\",
              \"group\": \"cert-renew\",
              \"sound\": \"bell\"
            }"

      # ── 7. Bark 通知：失败 ───────────────────────────────────
      - name: Notify failure
        if: failure()
        run: |
          curl -s -X POST "https://api.day.app/${{ vars.BARK_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"title\": \"❌ 证书更新失败\",
              \"body\": \"*.$DOMAIN 签发或部署出错，请检查 Actions 日志\",
              \"group\": \"cert-renew\",
              \"sound\": \"alarm\",
              \"level\": \"timeSensitive\"
            }"
```

其中用到了这些环境变量：

- Secrets：

  - `ACME_ACCOUNT_B64`，可以运行

    ```bash
    tar czf - -C ~/.acme.sh ca accounts \
    | base64 -w 0
    ```

    然后将输出内容粘贴进去。

  - `ALI_KEY` 和 `ALI_SECRET`

    参考 [获取阿里云 RAM 子用户 AccessKey](#获取阿里云-ram-子用户-accesskey) 节。

  - `DNSPOD_ID` 和 `DNSPOD_KEY`

    参考 [获取 DNSPod Token](#获取-dnspod-token) 节。

- Variables：

  - `ACME_EMAIL`，即你刚才安装时使用的邮箱。

  - `BARK_KEY`，用于使用 Bark 向你推送证书续期成功与否的消息；为 api.day.app 后面那一串

  - `ESA_SITE_ID`，用于指定证书上传的 ESA 站点。可在 [ESA 控制台](https://esa.console.aliyun.com/) 进入具体站点后查看左上角的“站点 ID”。

## 实际效果

blog.licaoz.com、dl.licaoz.com 与 jsd.licaoz.com 等由阿里云 ESA 加速的站点现已使用通过该自动化流程创建的 7 日证书，欢迎中国大陆的朋友查看本站证书详情了解。
