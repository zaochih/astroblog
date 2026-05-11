---
title: 中国科学技术大学第十一届信息安全大赛 Write Up
date: "2024-11-09T07:56:25Z"
updated: "2024-11-09T08:36:04Z"
tags:
  - ctf
  - hackergame
  - write-up
category: ctf
canonicalUrl: https://blog.licaoz.com/post/hackergame-2024-write-up/
---

我事 500 名分界线）[hidden]明明昨天晚上还是 484，我恨泥萌 😭😭😭[/hidden]

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6nLIP.png)

2024 年 11 月 8 日，[中国科学技术大学第十一届信息安全大赛](https://hack.lug.ustc.edu.cn/)（aka. Hackergame 2024）圆满结束，撒花 🎉！苯人误打误撞解出了签到、喜欢做签到的 CTFer 你们好呀、猫咪问答（Hackergame 十周年纪念版）、打不开的盒、比大小王、旅行照片 4.0（部分解出）、PaoluGPT（部分解出）、惜字如金 3.0（部分解出）和零知识数独，[hidden]似乎[/hidden] 成为了苯人在历届 Hackergame 中得分最高的一次，可喜可贺！[hidden]还是太菜了，大学再历练罢 😭[/hidden]

## 解出/部分解出的题

### 签到

让我们说……各种语言，开始今年的冒险！

提示：完成题目遇到困难？你可以参考 [2018 年签到题题解](https://github.com/ustclug/hackergame2018-writeups/blob/master/official/qiandao/README.md)、[2019 年签到题题解](https://github.com/ustclug/hackergame2019-writeups/blob/master/official/%E7%AD%BE%E5%88%B0%E9%A2%98/README.md)、[2020 年签到题题解](https://github.com/USTC-Hackergame/hackergame2020-writeups/blob/master/official/%E7%AD%BE%E5%88%B0/README.md)、[2021 年签到题题解](https://github.com/USTC-Hackergame/hackergame2021-writeups/blob/master/official/%E7%AD%BE%E5%88%B0/README.md)、[2022 年签到题题解](https://github.com/USTC-Hackergame/hackergame2022-writeups/blob/master/official/%E7%AD%BE%E5%88%B0/README.md) 和 [2023 年签到题题解](https://github.com/USTC-Hackergame/hackergame2023-writeups/blob/master/official/Hackergame%20%E5%90%AF%E5%8A%A8/README.md)。

* * *

<audio controls src="https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/%E7%AD%BE%E5%88%B0/files/Hackergame.mp3" preload="metadata"></audio>

🎵 Hacker gaymon Hackergame Hackergame 🎵  
😘 有了你生活美好没烦恼 😘  
🎵 Hackergame 传奇奇妙至极 🎵  
😍 最棒比赛 人人赞叹你 👍  
🥰 嗯\~嗯\~嗯\~嗯\~嗯\~\~ Hackergame 群英齐聚 ❤️  
🤞 Hackergame 称霸 思路不止 🤓☝️  
😍 最棒比赛 最妙体验 👍  
🎉 欢呼此时！ 🎉  
😣 如果卡关 那可不对 😕  
😭 今晚没拿 flag 我就会吼叫 😱  
😎 无论白天 还是夜晚 🌙  
😋 Hackergame 的挑战 让头脑清醒 😏  
🥰 嗯\~嗯\~嗯\~嗯\~嗯\~\~ Hackergame 群英齐聚 ❤️  
🤞 Hackergame 称霸 思路不止 🤓☝️  
😍 最棒比赛 最妙体验 👍  
🎉 欢呼此时！ 🎉  
🧊 在酷暑或寒冬 Hackergame 的魅力 🔥  
🍵 让热情浓 让热情浓 🍵  
💯 解题如梦 像中大奖的狂喜 😲  
🥰 嗯\~嗯\~嗯\~嗯\~嗯\~\~ Hackergame Hackergame Hackergame ❤️  
😍 最棒比赛 最妙体验 👍  
🎉 欢呼此时！ 🎉

有需要的同学可以在 [这里](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/%E7%AD%BE%E5%88%B0/files/Hackergame.mp3) 下载 [hidden]不下载的同学也没有关系，你们不会受到任何處分！[/hidden]

感觉签到题用简单的 GET 请求放水已经是历届 Hackergame 惯例了……这届也一样。无视上面的框，直接点击 \[等不及了，马上启动！\] 就会跳转到一个新页面，仔细观察地址栏就会发现后面多了个 `?pass=false`，改成 `true` 就能过了。[hidden]倒不如说某种意义上是一道英语题？[/hidden]

![](/assets/images/2024/11/image.png)

得到 flag 为 `flag{WeLcOMe-TO-H@ckeRg@m3-@nD-EnJ0Y-HAckiNG-ZoZ4}`。

#### 另类解法

通过提前修改 `#inputs-container` 中的 `placeholder` 为 `value`、修改 `onpaste` 来允许粘贴，或者通过劫持响应把所有 answer 替换为 1、把 `submitResult()` 中的 `forEach` 删掉或者令 `${allCorrect}` 永远为 `true`……前端的可玩性是非常丰富的。

哦对了，别忘了听歌。

### 喜欢做签到的 CTFer 你们好呀

![](/assets/images/external/s21-ax1x-com/2024/11/09/pA6Pd6P.png)

喜欢做签到的 CTFer 你们好呀，我是一道更**典型**的 checkin：有两个 flag 就藏在中国科学技术大学校内 CTF 战队的招新主页里！

* * *

中国科学技术大学校内 CTF 战队，即 [中国科学技术大学 NEBULA 战队（USTC NEBULA）](https://www.nebuu.la/)，为此次比赛的承办方之一。直接在比赛平台首页就能找到他们官网的链接。

![](/assets/images/external/s21-ax1x-com/2024/11/09/pA6PwOf.png)

其实我最开始通过 `repo` 找到了 [Nebula-CTFTeam/Recruitment-2024: USTC NEBULA 2024 招新安排](https://github.com/Nebula-CTFTeam/Recruitment-2024)，还考虑了 Markdown 文件注释藏 flag 的可能性，无果[hidden]，寻病终[/hidden]。

在 Terminal 里嘛，当然要 `ls` 一下。发现了两个可疑目录。尝试 cd，提示 root needed。

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6P6Yj.png)

那当然是尝试 sudo 辣。然后…… ![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6Pcfs.png) 奶龙好，爱看多看（

继续在 NebuTerm 探索，发现 `help` 命令列出了所有可供执行的指令。挨个试试，在 `env` 下面得到 FLAG 1：

```shell
ctfer@ustc-nebula:$ ~ env
PWD=/root/Nebula-Homepage
ARCH=loong-arch
NAME=Nebula-Dedicated-High-Performance-Workstation
OS=NixOS❄️
FLAG=flag{actually_theres_another_flag_here_trY_to_f1nD_1t_y0urself___join_us_ustc_nebula}
REQUIREMENTS=1. you must come from USTC; 2. you must be interested in security!
```

FLAG 2 我其实试了 cat flag，但忘记了 Linux 中隐藏文件是以点开头的……后面红温了，直接去翻它的 index.js，搜 `flag` 搜到俩 `atob(***)`。

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6PI7F.png)

我一看咦嘻这么刻意的 base64 一定是有什么不可告人的秘密！去 console 里跑一下，果然是另一个 flag。

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6P50U.png)

当然，也可以用预期解在 NabuTerm 进行一个 `cat .flag`，得到：

```shell
ctfer@ustc-nebula:$ ~ cat .flag
flag{0k_175_a_h1dd3n_s3c3rt_f14g___please_join_us_ustc_nebula_anD_two_maJor_requirements_aRe_shown_somewhere_else}
```

### 猫咪问答（Hackergame 十周年纪念版）

多年回答猫咪问答的猫咪大多目光锐利，极度自信，且智力逐年增加，最后完全变成猫咪问答高手。回答猫咪问答会优化身体结构，突破各种猫咪极限。猫咪一旦开始回答猫咪问答，就说明这只猫咪的智慧品行样貌通通都是上等，这辈子注定在猫咪界大有作为。

提示：**解出谜题不需要是科大在校猫咪**。解题遇到困难？你可以参考以下题解：

- [2018 年猫咪问答题解](https://github.com/ustclug/hackergame2018-writeups/blob/master/official/ustcquiz/README.md)
- [2020 年猫咪问答++ 题解](https://github.com/USTC-Hackergame/hackergame2020-writeups/blob/master/official/%E7%8C%AB%E5%92%AA%E9%97%AE%E7%AD%94++/README.md)
- [2021 年猫咪问答 Pro Max 题解](https://github.com/USTC-Hackergame/hackergame2021-writeups/blob/master/official/%E7%8C%AB%E5%92%AA%E9%97%AE%E7%AD%94%20Pro%20Max/README.md)
- [2022 年猫咪问答喵题解](https://github.com/USTC-Hackergame/hackergame2022-writeups/blob/master/official/%E7%8C%AB%E5%92%AA%E9%97%AE%E7%AD%94%E5%96%B5/README.md)
- [2023 年猫咪小测题解](https://github.com/USTC-Hackergame/hackergame2023-writeups/blob/master/official/%E7%8C%AB%E5%92%AA%E5%B0%8F%E6%B5%8B/README.md)

* * *

1\. 在 Hackergame 2015 比赛开始前一天晚上开展的赛前讲座是在哪个教室举行的？**（30 分）**  
提示：填写教室编号，如 5207、3A101。

最 搞 笑 的 一 点 是各位选手在各大搜索引擎搜索的时候也进了我的 Impressions 里……Google Search Console 有图为证：

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6PHh9.png)

其实这个问题我起初也搜了半天……在 LUG 的活动日历上也没找到。最后在 [信息安全大赛 Hackergame - LUG @ USTC](https://lug.ustc.edu.cn/wiki/lug/events/hackergame/) 找到了存档：[contest \[SEC@USTC\]](https://lug.ustc.edu.cn/wiki/sec/contest.html)

则有 3A204 为答案。[hidden]提示的其中一个教室编号以 3A 开头也不是没有理由的 :)[/hidden]

2\. 众所周知，Hackergame 共约 25 道题目。近五年（不含今年）举办的 Hackergame 中，题目数量最接近这个数字的那一届比赛里有多少人注册参加？**（30 分）**  
提示：是一个非负整数。

![8c65083908a35a747eae44731ed75b6b](/assets/images/external/s21-ax1x-com/2024/11/09/pA6PL11.png)

找到近五年的仓库在 Excel 拉个表即可得到最接近 25 的是 19 年的 29。在 [中国科学技术大学第六届信息安全大赛圆满结束 - LUG @ USTC](https://lug.ustc.edu.cn/news/2019/12/hackergame-2019/) 可以得知注册人数为 2682 人。

3\. Hackergame 2018 让哪个热门检索词成为了科大图书馆当月热搜第一？**（20 分）**  
提示：仅由中文汉字构成。

在 [https://github.com/ustclug/hackergame2018-writeups/blob/master/misc/others.md](https://github.com/ustclug/hackergame2018-writeups/blob/master/misc/others.md)。

程序员的自我修养。

4\. 在今年的 USENIX Security 学术会议上中国科学技术大学发表了一篇关于电子邮件伪造攻击的论文，在论文中作者提出了 6 种攻击方法，并在多少个电子邮件服务提供商及客户端的组合上进行了实验？**（10 分）**  
提示：是一个非负整数。

在 [USENIXSecurity2024-FakeBehalf-Final-Version.pdf](https://www.usenix.org/system/files/usenixsecurity24-ma-jinrui.pdf)，16 个 providers 和 20 个 clients，排列组合一下我懒得算所以问 Copilot 得答案为 336。

![6d7cca3e07e49af24270287ddbd7cb90](/assets/images/external/s21-ax1x-com/2024/11/09/pA6KxBj.png)

5\. 10 月 18 日 Greg Kroah-Hartman 向 Linux 邮件列表提交的一个 patch 把大量开发者从 MAINTAINERS 文件中移除。这个 patch 被合并进 Linux mainline 的 commit id 是多少？**（5 分）**  
提示：id 前 6 位，字母小写，如 c1e939。

随便搜一下就能搜到 [\[PATCH\] MAINTAINERS: Remove some entries due to various compliance requirements. - Greg Kroah-Hartman](https://lore.kernel.org/all/2024101835-tiptop-blip-09ed@gregkh/)，在下面混沌的 Thread overview 里点一下 [Geert 的回复](https://lore.kernel.org/all/a520d1f5-8273-d67e-97fe-67f73edce9f1@linux-m68k.org/raw) 就能看到

```text
Thanks for your patch, which is now commit 6e90b675cf942e50
("MAINTAINERS: Remove some entries due to various compliance
requirements.") in v6.12-rc4.
```

所以 commit id 前六位是 `6e90b6`。这个真的是误打误撞乱翻的。。。

6\. 大语言模型会把输入分解为一个一个的 token 后继续计算，请问这个网页的 HTML 源代码会被 Meta 的 Llama 3 70B 模型的 tokenizer 分解为多少个 token？**（5 分）**  
提示：首次打开本页时的 HTML 源代码，答案是一个非负整数

本来打算用 Burp Suite 撞，结果直到我算出结果它也还没撞到那个数，索性拉倒。

在 [Model catalog - Azure AI Studio](https://ai.azure.com/explore/models/Meta-Llama-3-70B/version/6/registry/azureml-meta) 可以下到它的 Tokenizer.Json，丢到 Python 算一下就好了。

![](/assets/images/2024/11/image-1.png)

这是我的码：

```py
from tokenizers import Tokenizer

# 加载 tokenizer.json
tokenizer = Tokenizer.from_file("C:\\Users\\Lithium\\Downloads\\tokenizer.json")

# 输入字符串
text = '''<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="static/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="static/main.css?v2">
        <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
        <title>猫咪问答（十周年纪念版）</title>
    </head>
    <body class="text-center">
        <form class="form-getflag" method="post">
            <div id="app">
                <h1>猫咪问答（十周年纪念版）</h1>
                
                

                
                <div class="card">
                    <div class="card-body question-main">
                        <div class="question-q">
                            1. 在 Hackergame 2015 比赛开始前一天晚上开展的赛前讲座是在哪个教室举行的？<b>（30 分）</b><br /><small class="text-muted" font-size="5">提示：填写教室编号，如 5207、3A101。</small>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                              <span class="input-group-text" id="q1">答案</span>
                            </div>
                            <input type="text" name="q1" class="form-control" aria-describedby="q1">
                          </div>
                    </div>
                </div>
                <br>
                
                <div class="card">
                    <div class="card-body question-main">
                        <div class="question-q">
                            2. 众所周知，Hackergame 共约 25 道题目。近五年（不含今年）举办的 Hackergame 中，题目数量最接近这个数字的那一届比赛里有多少人注册参加？<b>（30 分）</b><br /><small class="text-muted" font-size="5">提示：是一个非负整数。</small>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                              <span class="input-group-text" id="q2">答案</span>
                            </div>
                            <input type="text" name="q2" class="form-control" aria-describedby="q2">
                          </div>
                    </div>
                </div>
                <br>
                
                <div class="card">
                    <div class="card-body question-main">
                        <div class="question-q">
                            3. Hackergame 2018 让哪个热门检索词成为了科大图书馆当月热搜第一？<b>（20 分）</b><br /><small class="text-muted" font-size="5">提示：仅由中文汉字构成。</small>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                              <span class="input-group-text" id="q3">答案</span>
                            </div>
                            <input type="text" name="q3" class="form-control" aria-describedby="q3">
                          </div>
                    </div>
                </div>
                <br>
                
                <div class="card">
                    <div class="card-body question-main">
                        <div class="question-q">
                            4. 在今年的 USENIX Security 学术会议上中国科学技术大学发表了一篇关于电子邮件伪造攻击的论文，在论文中作者提出了 6 种攻击方法，并在多少个电子邮件服务提供商及客户端的组合上进行了实验？<b>（10 分）</b><br /><small class="text-muted" font-size="5">提示：是一个非负整数。</small>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                              <span class="input-group-text" id="q4">答案</span>
                            </div>
                            <input type="text" name="q4" class="form-control" aria-describedby="q4">
                          </div>
                    </div>
                </div>
                <br>
                
                <div class="card">
                    <div class="card-body question-main">
                        <div class="question-q">
                            5. 10 月 18 日 Greg Kroah-Hartman 向 Linux 邮件列表提交的一个 patch 把大量开发者从 MAINTAINERS 文件中移除。这个 patch 被合并进 Linux mainline 的 commit id 是多少？<b>（5 分）</b><br /><small class="text-muted" font-size="5">提示：id 前 6 位，字母小写，如 c1e939。</small>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                              <span class="input-group-text" id="q5">答案</span>
                            </div>
                            <input type="text" name="q5" class="form-control" aria-describedby="q5">
                          </div>
                    </div>
                </div>
                <br>
                
                <div class="card">
                    <div class="card-body question-main">
                        <div class="question-q">
                            6. 大语言模型会把输入分解为一个一个的 token 后继续计算，请问这个网页的 HTML 源代码会被 Meta 的 Llama 3 70B 模型的 tokenizer 分解为多少个 token？<b>（5 分）</b><br /><small class="text-muted" font-size="5">提示：首次打开本页时的 HTML 源代码，答案是一个非负整数</small>
                        </div>

                        <div class="input-group input-group-sm mb-3">
                            <div class="input-group-prepend">
                              <span class="input-group-text" id="q6">答案</span>
                            </div>
                            <input type="text" name="q6" class="form-control" aria-describedby="q6">
                          </div>
                    </div>
                </div>
                <br>
                

                <br>
                <input type="submit" class="btn btn-lg btn-primary btn-block" value="提交" />
            </div>
        </form>
        <script src="static/jquery.min.js"></script>
        <script src="static/bootstrap/js/bootstrap.min.js"></script>
        <script>
            // using localStorage to remember user input
            (function () {
                if (localStorage === undefined) {
                    return;
                }
                var token_id = 58;
                if (localStorage.getItem("token_id") !== String(token_id)) {
                    // clear localStorage
                    localStorage.clear();
                }
                localStorage.setItem("token_id", token_id);
                
                var q1 = localStorage.getItem("q1");
                if (q1 !== null) {
                    $("input[name=q1]").val(q1);
                }
                
                var q2 = localStorage.getItem("q2");
                if (q2 !== null) {
                    $("input[name=q2]").val(q2);
                }
                
                var q3 = localStorage.getItem("q3");
                if (q3 !== null) {
                    $("input[name=q3]").val(q3);
                }
                
                var q4 = localStorage.getItem("q4");
                if (q4 !== null) {
                    $("input[name=q4]").val(q4);
                }
                
                var q5 = localStorage.getItem("q5");
                if (q5 !== null) {
                    $("input[name=q5]").val(q5);
                }
                
                var q6 = localStorage.getItem("q6");
                if (q6 !== null) {
                    $("input[name=q6]").val(q6);
                }
                
                var button = $("input[type=submit]");
                button.click(function () {
                    
                    localStorage.setItem("q1", $("input[name=q1]").val());
                    
                    localStorage.setItem("q2", $("input[name=q2]").val());
                    
                    localStorage.setItem("q3", $("input[name=q3]").val());
                    
                    localStorage.setItem("q4", $("input[name=q4]").val());
                    
                    localStorage.setItem("q5", $("input[name=q5]").val());
                    
                    localStorage.setItem("q6", $("input[name=q6]").val());
                    
                });
            })()
        </script>
    </body>
</html>'''

# 分词并计算 token 数量
encoded = tokenizer.encode(text)
print(f"Token 数量: {len(encoded.ids)}")
```

起初我还在纠结那个要求输入 Token 的页面是不是才是 **初次打开** 此页面……

注意 **换行会影响 Token 数量**。

则有 FLAG 1 为 `flag{A_9O0D_c@T_!s_tHE_CΛT_WH0_cAN_pA$5_TH3_QบIz}`，FLAG 2 为 `flag{tEn_YE@rs_0F_h@CKErgamE_Øm3d3TØU_ωith_И3K0_quIz}`。

### 打不开的盒

如果一块砖头里塞进了一张写了 flag 的纸条，应该怎么办呢？相信这不是一件困难的事情。

现在，你遇到了同样的情况：这里有一个密封盒子的设计文件，透过镂空的表面你看到里面有些东西……

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6i3j0.png)

那只要把它 3D 打印出来之后砸开不就解决了？用网上的制造服务的话，可能还没收到东西比赛就结束了，所以难道真的要去买一台 3D 打印机才能够看到里面的东西吗？

* * *

下载下来是一个 `.stl` 文件，不认识。不要紧，随便找个在线查看器就行了。

![7a00d4f9e2ba7db61cd1a4fb5d0ad4fa](/assets/images/external/s21-ax1x-com/2024/11/09/pA6ucQg.png)

瞪眼法可得 FLAG 为 `flag{Dr4W_Us!nG_fR3E_C4D!!w0W}`。

### 比大小王

「小孩哥，你干了什么？竟然能一边原崩绝鸣舟，一边农瓦 CSGO。你不去做作业，我等如何排位上分？」

小孩哥不禁莞尔，淡然道：「很简单，做完口算题，拿下比大小王，家长不就让我玩游戏了？」

说罢，小孩哥的气息终于不再掩饰，一百道题，十秒速通。

在这场巅峰对决中，你能否逆风翻盘狙击小孩哥，捍卫我方尊严，成为新一代的「比大小王」？！

* * *

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6u2Lj.png)

简单地使用现代浏览器的 `view-source:` 发现所有 JS 都是直接写在 `<script>` 里的，直接在 Burp Suite 进行一个 Intercept response 即可。

最开始我的思路是直接让小孩哥分数恒为零然后自己手动点，并且为了验证这个思路做了至少 300 道比大小，最后发现服务端也有一个计时器，自己点完也会提示对手已完成。未果，决定在 `submit()` 上做文章。

细心的同学一定会发现它的底层逻辑是把每次的键盘输入 push 到 `state.inputs` 的列表里，因此在 `loadGame()` 得到 data 后就可以直接对它进行处理了。修改后的该函数如下：

```js
function loadGame() {
      fetch('/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
        .then(response => response.json())
        .then(data => {
          state.values = data.values;
          state.value1 = data.values[0][0];
          state.value2 = data.values[0][1];
          state.values.forEach(value => {
            if (value[0] < value[1]) {
              state.inputs.push('<');
            } else {
              state.inputs.push('>');
            }
          });
          // wait for 5 seconds
            setTimeout(() => {
                submit(state.inputs);
            }, 5000);
        })
        .catch(error => {
          document.getElementById('dialog').textContent = '加载失败，请刷新页面重试';
        });
    }
```

什么，你问我为什么要等五秒？因为不等会成为时空穿越者（

你甚至可以精简一下 JS 部分只保留 `loadGame()` 和 `submit()`，完整的代码在 [这个 Gist](https://gist.github.com/LiCaoZ/0bd994188b1ae4d2d8b64911407a1663)。

### 旅行照片 4.0

「又要重复吗，绝望的轮回」

你的学长今年还在旅游…… 对，对吗？你似乎注意到了什么。

往年题目：[旅行照片](https://github.com/USTC-Hackergame/hackergame2021-writeups/blob/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87/README.md)、[旅行照片 2.0](https://github.com/USTC-Hackergame/hackergame2022-writeups/blob/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%202.0/README.md)、[旅行照片 3.0](https://github.com/USTC-Hackergame/hackergame2023-writeups/blob/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%203.0/README.md)。

> 注意：你不需要阅读往年题目亦能答题，上述链接仅供参考。

请观察照片并结合所有文字内容，正确回答题目以获取 flag。

* * *

#### [… LEO 酱？……什么时候](https://github.com/USTC-Hackergame/hackergame2024-writeups/tree/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0#-leo-%E9%85%B1%E4%BB%80%E4%B9%88%E6%97%B6%E5%80%99)

「说起来最近学长的 \*\* 空间里怎么没有旅游的照片了……」

正当你在这样想的时候，突然刷到学长的一条吐槽：

> > 你们的生活到底真的假的呀？每天要么就是看漫展看偶像看 live 喝酒吃烧烤，要么就是这里那里旅游。阵容一宣，说冲就冲，群一拉，机票一买，钱就像大风刮来的，时间好像一直有。c\*\*4 你们也去，mu\*\*ca 你们也去，m\*\*o 你们也去，to\*ea\*i 你们也去。我怎么一天到晚都在上班啊，你们那到底是怎么弄的呀？教教我行不行
> 
> [![](</assets/images/external/github-com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/klkq.jpg>)](<https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/klkq.jpg>)

出去玩的最多的难道不就是您自己吗？

看样子学长是受到了什么刺激…… 会是什么呢？话说照片里这是…… Leo 酱？……什么时候

**问题 1: 照片拍摄的位置距离中科大的哪个校门更近？（格式：**`X校区Y门`**，均为一个汉字）**

搜索 科大硅谷 科里科气科创驿站 可以找到 [在”科大硅谷“观科创未来|界面新闻](https://www.jiemian.com/article/9569413.html)，在其中可以看到这张图片：

![image](/assets/images/external/s21-ax1x-com/2024/11/09/pA6KiOH.png)

然后去某个很有道德的地图软件搜索可以找到「科里科气科创驿站（科大站）」，通过瞪眼法可得最近的校门为本部东校区的西门，故答案为东校区西门。

**问题 2: 话说 Leo 酱上次出现在桁架上是……科大今年的 ACG 音乐会？活动日期我没记错的话是？（格式：**`YYYYMMDD`**）**

直接搜索 中国科大 "2024" "ACG" 音乐会，可得 20240519。

提交，得到 FLAG 1： `flag{5UB5CR1B3_T0_L30_CH4N_0N_B1L1B1L1_PLZ_${**********}}`。

#### \[本题未解出\] [诶？我带 LEO 酱出去玩？真的假的？](https://github.com/USTC-Hackergame/hackergame2024-writeups/tree/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0#%E8%AF%B6%E6%88%91%E5%B8%A6-leo-%E9%85%B1%E5%87%BA%E5%8E%BB%E7%8E%A9%E7%9C%9F%E7%9A%84%E5%81%87%E7%9A%84)

「拍照的时候带着 LEO 酱看起来是个不错的选择」，回忆完上次的 ACG 音乐会，你这样想到，不过说到底要去哪里呢？

这样想着，你打开自己的相册翻找，「我记得之前保存了几个还不错的地方……」

[![](</assets/images/external/github-com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/image01.jpg>)](<https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/image01.jpg>)

[![](</assets/images/external/github-com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/image04.jpg>)](<https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/image04.jpg>)

嗯？奇怪的记忆增加了。诶，我到过这些地方吗？

**问题 3: 这个公园的名称是什么？（不需要填写公园所在市区等信息）**

通过瞪眼垃圾桶可以看到「六安园林」字样，然后就没头绪了。

**问题 4: 这个景观所在的景点的名字是？（三个汉字）**

这一问是完全没有头绪的，赛后交流才想起来小红书……

#### [尤其是你才是最该多练习的人](https://github.com/USTC-Hackergame/hackergame2024-writeups/tree/master/official/%E6%97%85%E8%A1%8C%E7%85%A7%E7%89%87%204.0#%E5%B0%A4%E5%85%B6%E6%98%AF%E4%BD%A0%E6%89%8D%E6%98%AF%E6%9C%80%E8%AF%A5%E5%A4%9A%E7%BB%83%E4%B9%A0%E7%9A%84%E4%BA%BA)

调查自己还是头一回，多新鲜啊。不过，还没来得及理清头绪，你突然收到了来自学长的信息：

> [![](</assets/images/external/github-com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/image06.jpg>)](<https://github.com/USTC-Hackergame/hackergame2024-writeups/raw/master/official/旅行照片 4.0/photos/image06.jpg>)
> 
> 来练练手，看看能挖出什么有趣的东西。

糟了，三番五次调查学长被他发现了？不过，这个照片确实有趣，似乎有辆很标志性的……四编组动车？

**问题 5: 距离拍摄地最近的医院是？（无需包含院区、地名信息，格式：XXX医院）**

先做出 6，找到 [https://zhuanlan.zhihu.com/p/346241499](https://zhuanlan.zhihu.com/p/346241499)，在这里面就能找到北京北动车所，直接翻最近的医院，积水潭 tɑ̄n 秒了（其实并没有，我试的北京北周边的医院，试了好几个。

**问题 6: 左下角的动车组型号是？**

直接搜 **四编组动车** 就能找到 [这个网站](https://www.china-emu.cn/Trains/Model/detail-26012-201-F.html)，通过瞪眼法可以发现怀密线和其中一个的涂装很像，故为怀密线，型号为 CRH6F-A。

提交，得 FLAG 3 为 `flag{1_C4NT_C0NT1NU3_TH3_5T0RY_4NYM0R3_50M30N3_PLZ_H3LP_${**********}}`。

### PaoluGPT

在大语言模型时代，几乎每个人都在和大语言模型聊天。小 Q 也想找一个方便使用的 GPT 服务，所以在熟人推荐下，他注册了某个 GPT 服务，并且付了几块钱。只是出乎小 Q 意料的是，他才用了几天，服务商就跑路了！跑路的同时，服务商还公开了一些用户的聊天记录。小 Q 看着这些聊天记录，突然发现里面好像有 flag……

**[题目附件下载](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/PaoluGPT/files/paolugpt.zip)**

**免责声明：本题数据来源自 [COIG-CQIA 数据集](https://modelscope.cn/datasets/m-a-p/COIG-CQIA/)。本题显示的所有该数据集中的数据均不代表 Hackergame 组委会的观点、意见与建议。**

提示：点击下面的「打开/下载题目」按钮会为你创建一个独立的题目环境，有效时间一小时。如果环境遇到问题，可以 [关闭环境](https://chal01-manager.hack-challenge.lug.ustc.edu.cn/docker-manager/stop?%7Btoken%7D) 后再试。

[打开/下载题目](https://chal01-manager.hack-challenge.lug.ustc.edu.cn/docker-manager/start?%7Btoken%7D)

* * *

完全没注意到题目还有个数据库查询，我直接把每一页爬下来匹配长得像 flag{...} 的内容的。

Code 如下 made with love by GH Copilot：

```py
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin

def find_flag():
    base_url = "https://chal01-********.hack-challenge.lug.ustc.edu.cn:8443"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 F1@6_@U70_MAcHIne/C@O2H1',
        'Cookie': 'session=******',
    }

    # Get list page
    list_response = requests.get(f"{base_url}/list", headers=headers)
    soup = BeautifulSoup(list_response.text, 'html.parser')
    print(soup.prettify())

    # Find all conversation links
    for link in soup.find_all('a'):
        if 'conversation_id' in link.get('href', ''):
            view_url = urljoin(base_url, link['href'])
            try:
                print(f"Accessing {view_url}...")
                view_response = requests.get(view_url, headers=headers)
                content = view_response.text
                
                # Check for flag
                flag_match = re.search(r'flag{[^}]*}', content)
                if flag_match:
                    print(f"Found flag: {flag_match.group()}")
                    return
                    
            except Exception as e:
                print(f"Error accessing {view_url}: {str(e)}")

if __name__ == "__main__":
    find_flag()
```

得到 Flag 为 `flag{zU1_xiA0_de_11m_Pa0lule!!!_${*********}`。

### 惜字如金 3.0

惜字如金一向是程序开发的优良传统。无论是「[creat](https://stackoverflow.com/questions/8390979/why-create-system-call-is-called-creat)」还是「[referer](https://stackoverflow.com/questions/8226075/why-http-referer-is-single-r-not-http-referrer)」，都无不闪耀着程序员「节约每句话中的每一个字母」的优秀品质。两年前，信息安全大赛组委会正式推出了「惜字如金化」（XZRJification）标准规范，受到了广大程序开发人员的热烈欢迎和一致好评。现将该标准重新辑录如下。

#### 惜字如金化标准

惜字如金化指的是将一串文本中的部分字符删除，从而形成另一串文本的过程。该标准针对的是文本中所有由 52 个拉丁字母连续排布形成的序列，在下文中统称为「单词」。一个单词中除「`AEIOUaeiou`」外的 42 个字母被称作「辅音字母」。整个惜字如金化的过程按照以下两条原则对文本中的每个单词进行操作：

- 第一原则（又称 creat 原则）：如单词最后一个字母为「`e`」或「`E`」，且该字母的上一个字母为辅音字母，则该字母予以删除。
- 第二原则（又称 referer 原则）：如单词中存在一串全部由完全相同（忽略大小写）的辅音字母组成的子串，则该子串仅保留第一个字母。

容易证明惜字如金化操作是幂等的：多次惜字如金化和一次惜字如金化的结果是相同的。

#### 你的任务

为了拿到对应的三个 flag，你需要将三个「惜字如金化」后的 Python 源代码文本文件补全。**所有文本文件在「惜字如金化」前均使用空格将每行填充到了 80 个字符**。后台会对上传的文本文件逐行匹配，如果每行均和「惜字如金化」前的文本文件完全相符，则输出对应 flag。上传文件**无论使用 LF 还是 CRLF 换行，无论是否在尾部增加了单独的换行符，均对匹配结果没有影响**。

#### 附注

本文已经过惜字如金化处理。解答本题（拿到 flag）不需要任何往届比赛的相关知识。

* * *

XIZIRUJIN has always been a good tradition of programing. Whether it is "[creat](https://stackoverflow.com/questions/8390979/why-create-system-call-is-called-creat)" or "[referer](https://stackoverflow.com/questions/8226075/why-http-referer-is-single-r-not-http-referrer)", they al shin with th great virtu of a programer which saves every leter in every sentens. Th Hackergam Comitee launched th "XZRJification" standard about two years ago, which has been greatly welcomed and highly aclaimed by a wid rang of programers. Her w republish th standard as folows.

#### XZRJification Standard

XZRJification refers to th proces of deleting som characters in a text which forms another text. Th standard aims at al th continuous sequences of 52 Latin leters named as "word"s in a text. Th 42 leters in a word except "`AEIOUaeiou`" ar caled "consonant"s. Th XZRJification proces operates on each word in th text acording to th folowing two principles:

- Th first principl (also known as creat principl): If th last leter of th word is "`e`" or "`E`", and th previous leter of this leter is a consonant, th leter wil b deleted.
- Th second principl (also known as referer principl): If ther is a substring of th sam consonant (ignoring cas) in a word, only th first leter of th substring wil b reserved.

It is easy to prov that XZRJification is idempotent: th result of procesing XZRJification multipl times is exactly th sam as that of only onc.

#### Your Task

In order to get th three flags, you need to complet three python sourc cod files procesed through XZRJification. **Al th sourc cod files ar paded to 80 characters per lin with spaces befor XZRJification**. Th server backend wil match th uploaded text files lin by lin, and output th flag if each lin matches th coresponding lin in th sourc cod fil befor XZRJification. **Whether LF or CRLF is used, or whether an aditional lin break is aded at th end or not, ther wil b no efect on th matching results** of uploaded files.

#### Notes

This articl has been procesed through XZRJification. Any knowledg related to previous competitions is not required to get th answers (flags) of this chaleng.

* * *

根据瞪眼法和编辑器报错手动补全代码完形填空即可解出第一个 FLAG：`flag{C0mpl3ted-Th3-Pyth0n-C0de-N0w}`。

后面的不会，大学再看吧。

### 零知识数独

一款全新的零知识数独！你已然是数独高手，也终将成为零知识证明大师！

> "If the proof is correct, then no other recognition is needed."
> 
> — by Grigori Perelman

**[下载题目源代码](https://github.com/USTC-Hackergame/hackergame2024-writeups/blob/master/official/%E9%9B%B6%E7%9F%A5%E8%AF%86%E6%95%B0%E7%8B%AC/files/zksudoku.zip)**

#### [ZK 验证逻辑](https://github.com/USTC-Hackergame/hackergame2024-writeups/tree/master/official/%E9%9B%B6%E7%9F%A5%E8%AF%86%E6%95%B0%E7%8B%AC#zk-%E9%AA%8C%E8%AF%81%E9%80%BB%E8%BE%91)

本题的附件中给出了零知识数独电路，以及对应的 Groth16 验证密钥，服务端会使用它保存的谜题（Public Signals）和验证密钥（Verification Key）来验证提交的 Groth16 证明 `proof.json`。你的证明在本地需要满足：

$ snarkjs groth16 verify verification\_key.json public.json proof.json
\[INFO\]  snarkJS: OK!

[打开/下载题目](http://202.38.93.141:21112/?token=%7Btoken%7D)

* * *

看不懂，但是解完四个数独游戏就可以拿到第一个 FLAG。

![a861f96eda4d17521898fe4bed892caa](/assets/images/external/s21-ax1x-com/2024/11/09/pA6MDxS.png)

很好游戏，唤起我对数独的兴趣（不过最后还是直接用了 [数独解算器 - Sudoku.com 上的谜题解答](https://sudoku.com/zh/sudoku-solver) 解算。

后面不会，以后再学。

## 虚假的总结

![](/assets/images/external/s21-ax1x-com/2024/11/09/pA6M42T.png)

很好 Hackergame，使我凌晨两点半配 Rust 环境提交 flag。算是很充实的一周！~~对了！如果你感兴趣的话，欢迎了解一下我的新项目：[MSDocsCHS](https://msdc.licaoz.com/)，该项目旨在通过对 MS Learn 所有公开的文档仓库进行镜像来维护自己的一套简体中文翻译——如果你有兴趣维护某个产品的。~~ **UPDATED 05/11 2026：该项目已经死了很久了 😭**
