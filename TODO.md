# TODO

ok go! -> https://vtchat.io.vn/

--
fix github action failure

2025-06-29T12:04:48.5716027Z Current runner version: '2.325.0'
2025-06-29T12:04:48.5740590Z ##[group]Operating System
2025-06-29T12:04:48.5741792Z Ubuntu
2025-06-29T12:04:48.5742310Z 24.04.2
2025-06-29T12:04:48.5742763Z LTS
2025-06-29T12:04:48.5743291Z ##[endgroup]
2025-06-29T12:04:48.5743806Z ##[group]Runner Image
2025-06-29T12:04:48.5744375Z Image: ubuntu-24.04
2025-06-29T12:04:48.5744918Z Version: 20250622.1.0
2025-06-29T12:04:48.5745927Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250622.1/images/ubuntu/Ubuntu2404-Readme.md
2025-06-29T12:04:48.5747249Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250622.1
2025-06-29T12:04:48.5748198Z ##[endgroup]
2025-06-29T12:04:48.5748744Z ##[group]Runner Image Provisioner
2025-06-29T12:04:48.5749277Z 2.0.437.1
2025-06-29T12:04:48.5749821Z ##[endgroup]
2025-06-29T12:04:48.5752309Z ##[group]GITHUB_TOKEN Permissions
2025-06-29T12:04:48.5754435Z Actions: write
2025-06-29T12:04:48.5755158Z Attestations: write
2025-06-29T12:04:48.5755863Z Checks: write
2025-06-29T12:04:48.5756325Z Contents: write
2025-06-29T12:04:48.5756868Z Deployments: write
2025-06-29T12:04:48.5757439Z Discussions: write
2025-06-29T12:04:48.5757948Z Issues: write
2025-06-29T12:04:48.5758439Z Metadata: read
2025-06-29T12:04:48.5758945Z Models: read
2025-06-29T12:04:48.5759438Z Packages: write
2025-06-29T12:04:48.5759995Z Pages: write
2025-06-29T12:04:48.5760495Z PullRequests: write
2025-06-29T12:04:48.5761222Z RepositoryProjects: write
2025-06-29T12:04:48.5761862Z SecurityEvents: write
2025-06-29T12:04:48.5762389Z Statuses: write
2025-06-29T12:04:48.5762843Z ##[endgroup]
2025-06-29T12:04:48.5764838Z Secret source: Actions
2025-06-29T12:04:48.5765651Z Prepare workflow directory
2025-06-29T12:04:48.6085484Z Prepare all required actions
2025-06-29T12:04:48.6122321Z Getting action download info
2025-06-29T12:04:49.0736342Z ##[group]Download immutable action package 'actions/checkout@v4'
2025-06-29T12:04:49.0737365Z Version: 4.2.2
2025-06-29T12:04:49.0738396Z Digest: sha256:ccb2698953eaebd21c7bf6268a94f9c26518a7e38e27e0b83c1fe1ad049819b1
2025-06-29T12:04:49.0739540Z Source commit SHA: 11bd71901bbe5b1630ceea73d27597364c9af683
2025-06-29T12:04:49.0740310Z ##[endgroup]
2025-06-29T12:04:49.4735587Z Download action repository 'superfly/flyctl-actions@master' (SHA:63da3ecc5e2793b98a3f2519b3d75d4f4c11cec2)
2025-06-29T12:04:50.0662586Z Complete job name: Deploy app
2025-06-29T12:04:50.1364860Z ##[group]Run actions/checkout@v4
2025-06-29T12:04:50.1365831Z with:
2025-06-29T12:04:50.1366282Z   repository: vinhnx/vtchat
2025-06-29T12:04:50.1366961Z   token: ***
2025-06-29T12:04:50.1367387Z   ssh-strict: true
2025-06-29T12:04:50.1367827Z   ssh-user: git
2025-06-29T12:04:50.1368276Z   persist-credentials: true
2025-06-29T12:04:50.1368773Z   clean: true
2025-06-29T12:04:50.1369212Z   sparse-checkout-cone-mode: true
2025-06-29T12:04:50.1369737Z   fetch-depth: 1
2025-06-29T12:04:50.1370164Z   fetch-tags: false
2025-06-29T12:04:50.1370614Z   show-progress: true
2025-06-29T12:04:50.1371222Z   lfs: false
2025-06-29T12:04:50.1371674Z   submodules: false
2025-06-29T12:04:50.1372121Z   set-safe-directory: true
2025-06-29T12:04:50.1372854Z ##[endgroup]
2025-06-29T12:04:51.8314053Z Syncing repository: vinhnx/vtchat
2025-06-29T12:04:51.8315562Z ##[group]Getting Git version info
2025-06-29T12:04:51.8316001Z Working directory is '/home/runner/work/vtchat/vtchat'
2025-06-29T12:04:51.8316676Z [command]/usr/bin/git version
2025-06-29T12:04:51.9274383Z git version 2.49.0
2025-06-29T12:04:51.9368904Z ##[endgroup]
2025-06-29T12:04:51.9385830Z Temporarily overriding HOME='/home/runner/work/_temp/1ab62d61-a425-4302-89a8-fc662b9b87d4' before making global git config changes
2025-06-29T12:04:51.9387331Z Adding repository directory to the temporary git global config as a safe directory
2025-06-29T12:04:51.9400442Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/vtchat/vtchat
2025-06-29T12:04:51.9480492Z Deleting the contents of '/home/runner/work/vtchat/vtchat'
2025-06-29T12:04:51.9484375Z ##[group]Initializing the repository
2025-06-29T12:04:51.9488419Z [command]/usr/bin/git init /home/runner/work/vtchat/vtchat
2025-06-29T12:04:51.9821635Z hint: Using 'master' as the name for the initial branch. This default branch name
2025-06-29T12:04:51.9822898Z hint: is subject to change. To configure the initial branch name to use in all
2025-06-29T12:04:51.9823992Z hint: of your new repositories, which will suppress this warning, call:
2025-06-29T12:04:51.9824802Z hint:
2025-06-29T12:04:51.9825443Z hint: 	git config --global init.defaultBranch <name>
2025-06-29T12:04:51.9826111Z hint:
2025-06-29T12:04:51.9826760Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2025-06-29T12:04:51.9827747Z hint: 'development'. The just-created branch can be renamed via this command:
2025-06-29T12:04:51.9828514Z hint:
2025-06-29T12:04:51.9828981Z hint: 	git branch -m <name>
2025-06-29T12:04:51.9939016Z Initialized empty Git repository in /home/runner/work/vtchat/vtchat/.git/
2025-06-29T12:04:51.9952651Z [command]/usr/bin/git remote add origin https://github.com/vinhnx/vtchat
2025-06-29T12:04:52.0035757Z ##[endgroup]
2025-06-29T12:04:52.0036300Z ##[group]Disabling automatic garbage collection
2025-06-29T12:04:52.0040205Z [command]/usr/bin/git config --local gc.auto 0
2025-06-29T12:04:52.0070486Z ##[endgroup]
2025-06-29T12:04:52.0071525Z ##[group]Setting up auth
2025-06-29T12:04:52.0078893Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2025-06-29T12:04:52.0109683Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2025-06-29T12:04:52.1734075Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2025-06-29T12:04:52.1764152Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2025-06-29T12:04:52.1983815Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2025-06-29T12:04:52.2018964Z ##[endgroup]
2025-06-29T12:04:52.2019819Z ##[group]Fetching the repository
2025-06-29T12:04:52.2028400Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +03ed60a01591f9215771014813703ea66842cf03:refs/remotes/origin/main
2025-06-29T12:04:53.1221786Z From https://github.com/vinhnx/vtchat
2025-06-29T12:04:53.1222564Z  * [new ref]         03ed60a01591f9215771014813703ea66842cf03 -> origin/main
2025-06-29T12:04:53.1295945Z ##[endgroup]
2025-06-29T12:04:53.1296416Z ##[group]Determining the checkout info
2025-06-29T12:04:53.1299061Z ##[endgroup]
2025-06-29T12:04:53.1304405Z [command]/usr/bin/git sparse-checkout disable
2025-06-29T12:04:53.1388990Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2025-06-29T12:04:53.1416761Z ##[group]Checking out the ref
2025-06-29T12:04:53.1421010Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2025-06-29T12:04:53.1928448Z Switched to a new branch 'main'
2025-06-29T12:04:53.1929781Z branch 'main' set up to track 'origin/main'.
2025-06-29T12:04:53.1937786Z ##[endgroup]
2025-06-29T12:04:53.1975718Z [command]/usr/bin/git log -1 --format=%H
2025-06-29T12:04:53.1998248Z 03ed60a01591f9215771014813703ea66842cf03
2025-06-29T12:04:53.2205810Z ##[group]Run superfly/flyctl-actions/setup-flyctl@master
2025-06-29T12:04:53.2206139Z with:
2025-06-29T12:04:53.2206316Z   version: latest
2025-06-29T12:04:53.2206503Z ##[endgroup]
2025-06-29T12:04:54.2797343Z Acquired 0.3.145 from https://github.com/superfly/flyctl/releases/download/v0.3.145/flyctl_0.3.145_Linux_x86_64.tar.gz
2025-06-29T12:04:54.2887534Z [command]/usr/bin/tar xz --warning=no-unknown-keyword --overwrite -C /home/runner/work/_temp/350caedf-7e20-4a49-838e-a6515b7079fe -f /home/runner/work/_temp/dadee162-0477-4ad4-b5e9-679dc51aa979
2025-06-29T12:04:54.9660037Z Successfully cached flyctl to /opt/hostedtoolcache/flyctl/0.3.145/x86_64
2025-06-29T12:04:54.9661828Z Added flyctl to the path
2025-06-29T12:04:54.9794844Z ##[group]Run flyctl deploy --remote-only
2025-06-29T12:04:54.9795243Z [36;1mflyctl deploy --remote-only[0m
2025-06-29T12:04:55.0224388Z shell: /usr/bin/bash -e {0}
2025-06-29T12:04:55.0224644Z env:
2025-06-29T12:04:55.0228384Z   FLY_API_TOKEN: ***
2025-06-29T12:04:55.0229241Z   DATABASE_URL: ***
2025-06-29T12:04:55.0229439Z ##[endgroup]
2025-06-29T12:04:55.2450529Z ==> Verifying app config
2025-06-29T12:04:55.2453094Z --> Verified app config
2025-06-29T12:04:55.2453676Z Validating /home/runner/work/vtchat/vtchat/fly.toml
2025-06-29T12:04:55.2454538Z [32m✓[0m Configuration is valid
2025-06-29T12:04:55.4102474Z ==> Building image
2025-06-29T12:04:55.5383582Z Waiting for depot builder...
2025-06-29T12:04:55.5383804Z
2025-06-29T12:05:14.9677882Z ==> Building image with Depot
2025-06-29T12:05:14.9678691Z --> build:  (​)
2025-06-29T12:05:15.1453331Z #1 [internal] load build definition from Dockerfile
2025-06-29T12:05:15.1453726Z #1 DONE 0.0s
2025-06-29T12:05:15.2994433Z
2025-06-29T12:05:15.2994868Z #1 [internal] load build definition from Dockerfile
2025-06-29T12:05:15.2995293Z #1 transferring dockerfile:
2025-06-29T12:05:15.6911086Z #1 transferring dockerfile: 2.74kB 0.5s done
2025-06-29T12:05:15.8693007Z #1 DONE 0.5s
2025-06-29T12:05:15.8693340Z
2025-06-29T12:05:15.8693648Z #2 resolve image config for docker-image://docker.io/docker/dockerfile:1
2025-06-29T12:05:17.8013455Z #2 DONE 2.1s
2025-06-29T12:05:17.9439347Z
2025-06-29T12:05:17.9440471Z #3 docker-image://docker.io/docker/dockerfile:1@sha256:9857836c9ee4268391bb5b09f9f157f3c91bb15821bb77969642813b0d00518d
2025-06-29T12:05:17.9442093Z #3 resolve docker.io/docker/dockerfile:1@sha256:9857836c9ee4268391bb5b09f9f157f3c91bb15821bb77969642813b0d00518d done
2025-06-29T12:05:17.9442800Z #3 CACHED
2025-06-29T12:05:18.1015467Z
2025-06-29T12:05:18.1015994Z #1 [internal] load build definition from Dockerfile
2025-06-29T12:05:18.1016527Z #1 transferring dockerfile: 2.74kB 0.5s done
2025-06-29T12:05:18.1016894Z #1 DONE 0.5s
2025-06-29T12:05:18.1017057Z
2025-06-29T12:05:18.1017226Z #4 [internal] load build definition from Dockerfile
2025-06-29T12:05:18.1017976Z #4 Deduplicating step ID [internal] load build definition from Dockerfile, another build is calculating it done
2025-06-29T12:05:18.1018545Z #4 DONE 0.0s
2025-06-29T12:05:18.1018665Z
2025-06-29T12:05:18.1018876Z #5 [internal] load metadata for gcr.io/distroless/nodejs20-debian12:latest
2025-06-29T12:05:18.3858111Z #5 DONE 0.4s
2025-06-29T12:05:18.3858289Z
2025-06-29T12:05:18.3858458Z #6 [internal] load metadata for docker.io/oven/bun:1-alpine
2025-06-29T12:05:19.0655924Z #6 DONE 1.1s
2025-06-29T12:05:19.2196740Z
2025-06-29T12:05:19.2196903Z #7 [internal] load .dockerignore
2025-06-29T12:05:19.2197214Z #7 transferring context:
2025-06-29T12:05:19.5996866Z #7 transferring context: 865B 0.5s done
2025-06-29T12:05:19.8269977Z #7 DONE 0.5s
2025-06-29T12:05:19.8270234Z
2025-06-29T12:05:19.8271043Z #8 [runner 1/5] FROM gcr.io/distroless/nodejs20-debian12:latest@sha256:05c79ce75a5807df4b3dd73467135e153f51ce1ecafd2284d3a06434cc0fd025
2025-06-29T12:05:19.8272058Z #8 resolve gcr.io/distroless/nodejs20-debian12:latest@sha256:05c79ce75a5807df4b3dd73467135e153f51ce1ecafd2284d3a06434cc0fd025 done
2025-06-29T12:05:19.8272676Z #8 DONE 0.0s
2025-06-29T12:05:19.8272793Z
2025-06-29T12:05:19.8273151Z #9 [base 1/3] FROM docker.io/oven/bun:1-alpine@sha256:6cb88d90f8a96249e272ba877885d5251a77e1d7a44b4d89565ded015fe5be2d
2025-06-29T12:05:19.8273973Z #9 resolve docker.io/oven/bun:1-alpine@sha256:6cb88d90f8a96249e272ba877885d5251a77e1d7a44b4d89565ded015fe5be2d done
2025-06-29T12:05:19.8274505Z #9 DONE 0.0s
2025-06-29T12:05:19.8274621Z
2025-06-29T12:05:19.8274714Z #10 [internal] load build context
2025-06-29T12:05:22.7863127Z #10 transferring context: 4.65MB 3.0s done
2025-06-29T12:05:22.7863710Z #10 DONE 3.0s
2025-06-29T12:05:22.7863936Z
2025-06-29T12:05:22.7864538Z #11 [base 3/3] WORKDIR /app
2025-06-29T12:05:22.7864835Z #11 CACHED
2025-06-29T12:05:22.7864971Z
2025-06-29T12:05:22.7865334Z #12 [builder 1/5] WORKDIR /app
2025-06-29T12:05:22.7865624Z #12 CACHED
2025-06-29T12:05:22.7865760Z
2025-06-29T12:05:22.7865900Z #13 [deps 1/5] COPY package.json bun.lock ./
2025-06-29T12:05:22.7866285Z #13 CACHED
2025-06-29T12:05:22.7866427Z
2025-06-29T12:05:22.7866547Z #14 [deps 2/5] COPY turbo.json ./
2025-06-29T12:05:22.7866802Z #14 CACHED
2025-06-29T12:05:22.7866920Z
2025-06-29T12:05:22.7867118Z #15 [builder 2/5] COPY --from=deps /app/node_modules ./node_modules
2025-06-29T12:05:22.7867562Z #15 CACHED
2025-06-29T12:05:22.7867675Z
2025-06-29T12:05:22.7869155Z #16 [deps 5/5] RUN --mount=type=cache,target=/root/.bun/install/cache     --mount=type=cache,target=/app/node_modules/.cache     --mount=type=cache,target=/tmp/better-sqlite3-build     export BETTER_SQLITE3_CACHE_DIR=/tmp/better-sqlite3-build &&     export npm_config_build_from_source=true &&     export npm_config_cache=/app/node_modules/.cache &&     bun install --frozen-lockfile --no-verify
2025-06-29T12:05:22.7870739Z #16 CACHED
2025-06-29T12:05:22.7871044Z
2025-06-29T12:05:22.7871300Z #17 [builder 3/5] COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
2025-06-29T12:05:22.7871724Z #17 CACHED
2025-06-29T12:05:22.7871834Z
2025-06-29T12:05:22.7872442Z #18 [base 2/3] RUN --mount=type=cache,target=/var/cache/apk     apk add --no-cache     libc6-compat     curl     python3     make     g++     sqlite     sqlite-dev     nodejs     npm &&     npm install -g node-gyp
2025-06-29T12:05:22.7873212Z #18 CACHED
2025-06-29T12:05:22.7873323Z
2025-06-29T12:05:22.7873459Z #19 [deps 3/5] COPY apps/web/package.json ./apps/web/
2025-06-29T12:05:22.7873767Z #19 CACHED
2025-06-29T12:05:22.7873871Z
2025-06-29T12:05:22.7873984Z #20 [deps 4/5] COPY packages/ ./packages/
2025-06-29T12:05:22.7874260Z #20 CACHED
2025-06-29T12:05:22.7874372Z
2025-06-29T12:05:22.7874463Z #21 [builder 4/5] COPY . .
2025-06-29T12:05:22.7874700Z #21 CACHED
2025-06-29T12:05:22.7874804Z
2025-06-29T12:05:22.7875331Z #22 [builder 5/5] RUN --mount=type=cache,target=/app/apps/web/.next/cache     --mount=type=cache,target=/root/.bun/install/cache     cd apps/web &&     bun run build
2025-06-29T12:05:22.8249829Z #22 0.190 $ next build
2025-06-29T12:05:24.4329849Z #22 1.798    ▲ Next.js 15.3.3
2025-06-29T12:05:24.6407700Z #22 1.798    - Experiments (use with caution):
2025-06-29T12:05:24.6408272Z #22 1.798      ⨯ serverMinification
2025-06-29T12:05:24.6408539Z #22 1.799
2025-06-29T12:05:24.6408785Z #22 1.855    Creating an optimized production build ...
2025-06-29T12:05:56.4484290Z #22 33.81  ⚠ Compiled with warnings in 31.0s
2025-06-29T12:05:56.4484792Z #22 33.81
2025-06-29T12:05:56.6021750Z #22 33.81 ../../packages/ui/src/components/index.ts
2025-06-29T12:05:56.6022921Z #22 33.81 The requested module './dialog-premium' contains conflicting star exports for the names 'Dialog', 'DialogClose', 'DialogPortal', 'DialogTrigger' with the previous requested module './dialog'
2025-06-29T12:05:56.6023879Z #22 33.81
2025-06-29T12:05:56.6024119Z #22 33.81 Import trace for requested module:
2025-06-29T12:05:56.6024503Z #22 33.81 ../../packages/ui/src/components/index.ts
2025-06-29T12:05:56.6024813Z #22 33.81 ../../packages/ui/src/index.ts
2025-06-29T12:05:56.6025066Z #22 33.81 ../../packages/ui/index.ts
2025-06-29T12:05:56.6025335Z #22 33.81 ../../packages/ui/src/components/carousel.tsx
2025-06-29T12:05:56.6025603Z #22 33.81
2025-06-29T12:05:56.6025804Z #22 33.81 ../../packages/ui/src/components/index.ts
2025-06-29T12:05:56.6026575Z #22 33.81 The requested module './dialog-premium' contains conflicting star exports for the names 'Dialog', 'DialogClose', 'DialogPortal', 'DialogTrigger' with the previous requested module './dialog'
2025-06-29T12:05:56.6027307Z #22 33.81
2025-06-29T12:05:56.6027490Z #22 33.81 Import trace for requested module:
2025-06-29T12:05:56.6027769Z #22 33.81 ../../packages/ui/src/components/index.ts
2025-06-29T12:05:56.6028395Z #22 33.81 ../../packages/ui/src/index.ts
2025-06-29T12:05:56.6028641Z #22 33.81 ../../packages/ui/index.ts
2025-06-29T12:05:56.6029007Z #22 33.81 ./app/global-error.tsx
2025-06-29T12:05:56.6029226Z #22 33.81
2025-06-29T12:05:56.6029420Z #22 33.81 ../../packages/ui/src/components/index.ts
2025-06-29T12:05:56.6030192Z #22 33.81 The requested module './dialog-premium' contains conflicting star exports for the names 'Dialog', 'DialogClose', 'DialogPortal', 'DialogTrigger' with the previous requested module './dialog'
2025-06-29T12:05:56.6031144Z #22 33.81
2025-06-29T12:05:56.6031339Z #22 33.81 Import trace for requested module:
2025-06-29T12:05:56.6031617Z #22 33.81 ../../packages/ui/src/components/index.ts
2025-06-29T12:05:56.6031887Z #22 33.81 ../../packages/ui/src/index.ts
2025-06-29T12:05:56.6032127Z #22 33.81 ../../packages/ui/index.ts
2025-06-29T12:05:56.6032369Z #22 33.81 ./app/not-found.tsx
2025-06-29T12:05:56.6032580Z #22 33.81
2025-06-29T12:05:56.6032763Z #22 33.82    Skipping validation of types
2025-06-29T12:05:56.6033018Z #22 33.82    Skipping linting
2025-06-29T12:05:56.9272182Z #22 34.29    Collecting page data ...
2025-06-29T12:05:58.3033042Z #22 35.67 Error: DATABASE_URL environment variable is required
2025-06-29T12:05:58.3033694Z #22 35.67     at 52368 (.next/server/chunks/6991.js:384:11)
2025-06-29T12:05:58.3034182Z #22 35.67     at __webpack_require__ (.next/server/webpack-runtime.js:25:43)
2025-06-29T12:05:58.3034743Z #22 35.67     at 61886 (.next/server/app/api/auth/list-accounts/route.js:242:67)
2025-06-29T12:05:58.3035282Z #22 35.67     at __webpack_require__ (.next/server/webpack-runtime.js:25:43)
2025-06-29T12:05:58.3035795Z #22 35.67     at 60360 (.next/server/app/api/auth/list-accounts/route.js:137:19)
2025-06-29T12:05:58.3036312Z #22 35.67     at __webpack_require__ (.next/server/webpack-runtime.js:25:43)
2025-06-29T12:05:58.3036915Z #22 35.67     at __webpack_exec__ (.next/server/app/api/auth/list-accounts/route.js:417:39)
2025-06-29T12:05:58.3037616Z #22 35.67     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:87)
2025-06-29T12:05:58.3038294Z #22 35.67     at __webpack_require__.X (.next/server/webpack-runtime.js:155:21)
2025-06-29T12:05:58.3038976Z #22 35.67     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:47)
2025-06-29T12:05:58.4472104Z #22 35.67
2025-06-29T12:05:58.4472402Z #22 35.68 > Build error occurred
2025-06-29T12:05:58.4472888Z #22 35.68 [Error: Failed to collect page data for /api/auth/list-accounts] {
2025-06-29T12:05:58.4473303Z #22 35.68   type: 'Error'
2025-06-29T12:05:58.4473549Z #22 35.68 }
2025-06-29T12:05:58.4473794Z #22 35.81 error: script "build" exited with code 1
2025-06-29T12:05:58.6620005Z #22 ERROR: process "/bin/sh -c cd apps/web &&     bun run build" did not complete successfully: exit code: 1
2025-06-29T12:05:58.6917129Z ------
2025-06-29T12:05:58.6918387Z  > [builder 5/5] RUN --mount=type=cache,target=/app/apps/web/.next/cache     --mount=type=cache,target=/root/.bun/install/cache     cd apps/web &&     bun run build:
2025-06-29T12:05:58.6920028Z 35.67     at __webpack_exec__ (.next/server/app/api/auth/list-accounts/route.js:417:39)
2025-06-29T12:05:58.6921364Z 35.67     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:87)
2025-06-29T12:05:58.6922335Z 35.67     at __webpack_require__.X (.next/server/webpack-runtime.js:155:21)
2025-06-29T12:05:58.6923078Z 35.67     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:47)
2025-06-29T12:05:58.6923531Z 35.67
2025-06-29T12:05:58.6923780Z 35.68 > Build error occurred
2025-06-29T12:05:58.6924244Z 35.68 [Error: Failed to collect page data for /api/auth/list-accounts] {
2025-06-29T12:05:58.6924660Z 35.68   type: 'Error'
2025-06-29T12:05:58.6924854Z 35.68 }
2025-06-29T12:05:58.6925060Z 35.81 error: script "build" exited with code 1
2025-06-29T12:05:58.6925329Z ------
2025-06-29T12:05:58.9894310Z ==> Building image
2025-06-29T12:05:59.1317392Z Waiting for depot builder...
2025-06-29T12:05:59.1317769Z
2025-06-29T12:06:00.3266631Z ==> Building image with Depot
2025-06-29T12:06:00.3267769Z --> build:  (​)
2025-06-29T12:06:00.5057688Z #1 [internal] load build definition from Dockerfile
2025-06-29T12:06:00.5058734Z #1 DONE 0.0s
2025-06-29T12:06:00.6594495Z
2025-06-29T12:06:00.6594991Z #1 [internal] load build definition from Dockerfile
2025-06-29T12:06:00.6595479Z #1 transferring dockerfile:
2025-06-29T12:06:01.0504468Z #1 transferring dockerfile: 2.74kB 0.5s done
2025-06-29T12:06:01.2062822Z #1 DONE 0.5s
2025-06-29T12:06:01.2063049Z
2025-06-29T12:06:01.2063389Z #2 resolve image config for docker-image://docker.io/docker/dockerfile:1
2025-06-29T12:06:02.1017023Z #2 DONE 1.0s
2025-06-29T12:06:02.2023772Z
2025-06-29T12:06:02.2024784Z #3 docker-image://docker.io/docker/dockerfile:1@sha256:9857836c9ee4268391bb5b09f9f157f3c91bb15821bb77969642813b0d00518d
2025-06-29T12:06:02.2026057Z #3 resolve docker.io/docker/dockerfile:1@sha256:9857836c9ee4268391bb5b09f9f157f3c91bb15821bb77969642813b0d00518d done
2025-06-29T12:06:02.2026735Z #3 CACHED
2025-06-29T12:06:02.2026905Z
2025-06-29T12:06:02.2027066Z #1 [internal] load build definition from Dockerfile
2025-06-29T12:06:02.2027484Z #1 transferring dockerfile: 2.74kB 0.5s done
2025-06-29T12:06:02.2027834Z #1 DONE 0.5s
2025-06-29T12:06:02.2027971Z
2025-06-29T12:06:02.2028121Z #4 [internal] load build definition from Dockerfile
2025-06-29T12:06:02.2028805Z #4 Deduplicating step ID [internal] load build definition from Dockerfile, another build is calculating it done
2025-06-29T12:06:02.2029419Z #4 DONE 0.0s
2025-06-29T12:06:02.2029559Z
2025-06-29T12:06:02.2029740Z #5 [internal] load metadata for docker.io/oven/bun:1-alpine
2025-06-29T12:06:02.6114841Z #5 ...
2025-06-29T12:06:02.6115145Z
2025-06-29T12:06:02.6115594Z #6 [internal] load metadata for gcr.io/distroless/nodejs20-debian12:latest
2025-06-29T12:06:02.6175329Z #6 DONE 0.4s
2025-06-29T12:06:02.8319976Z
2025-06-29T12:06:02.8320370Z #5 [internal] load metadata for docker.io/oven/bun:1-alpine
2025-06-29T12:06:02.8320771Z #5 DONE 0.5s
2025-06-29T12:06:02.8321177Z
2025-06-29T12:06:02.8321323Z #7 [internal] load .dockerignore
2025-06-29T12:06:02.8321639Z #7 transferring context:
2025-06-29T12:06:03.2123518Z #7 transferring context: 865B 0.5s done
2025-06-29T12:06:03.4382761Z #7 DONE 0.5s
2025-06-29T12:06:03.4383020Z
2025-06-29T12:06:03.4383926Z #8 [runner 1/5] FROM gcr.io/distroless/nodejs20-debian12:latest@sha256:05c79ce75a5807df4b3dd73467135e153f51ce1ecafd2284d3a06434cc0fd025
2025-06-29T12:06:03.4386199Z #8 resolve gcr.io/distroless/nodejs20-debian12:latest@sha256:05c79ce75a5807df4b3dd73467135e153f51ce1ecafd2284d3a06434cc0fd025 done
2025-06-29T12:06:03.4387620Z #8 DONE 0.0s
2025-06-29T12:06:03.4387853Z
2025-06-29T12:06:03.4388682Z #9 [base 1/3] FROM docker.io/oven/bun:1-alpine@sha256:6cb88d90f8a96249e272ba877885d5251a77e1d7a44b4d89565ded015fe5be2d
2025-06-29T12:06:03.4390562Z #9 resolve docker.io/oven/bun:1-alpine@sha256:6cb88d90f8a96249e272ba877885d5251a77e1d7a44b4d89565ded015fe5be2d done
2025-06-29T12:06:03.4392166Z #9 DONE 0.0s
2025-06-29T12:06:03.4392440Z
2025-06-29T12:06:03.4392653Z #10 [internal] load build context
2025-06-29T12:06:03.9367574Z #10 transferring context: 39.09kB 0.7s done
2025-06-29T12:06:04.0382622Z #10 DONE 0.7s
2025-06-29T12:06:04.0382816Z
2025-06-29T12:06:04.0383520Z #11 [base 2/3] RUN --mount=type=cache,target=/var/cache/apk     apk add --no-cache     libc6-compat     curl     python3     make     g++     sqlite     sqlite-dev     nodejs     npm &&     npm install -g node-gyp
2025-06-29T12:06:04.0384405Z #11 CACHED
2025-06-29T12:06:04.0384535Z
2025-06-29T12:06:04.0384658Z #12 [deps 2/5] COPY turbo.json ./
2025-06-29T12:06:04.0384926Z #12 CACHED
2025-06-29T12:06:04.0385036Z
2025-06-29T12:06:04.0385165Z #13 [deps 3/5] COPY apps/web/package.json ./apps/web/
2025-06-29T12:06:04.0385467Z #13 CACHED
2025-06-29T12:06:04.0385570Z
2025-06-29T12:06:04.0385660Z #14 [base 3/3] WORKDIR /app
2025-06-29T12:06:04.0385877Z #14 CACHED
2025-06-29T12:06:04.0385980Z
2025-06-29T12:06:04.0386069Z #15 [builder 1/5] WORKDIR /app
2025-06-29T12:06:04.0386295Z #15 CACHED
2025-06-29T12:06:04.0386705Z
2025-06-29T12:06:04.0386811Z #16 [deps 4/5] COPY packages/ ./packages/
2025-06-29T12:06:04.0387073Z #16 CACHED
2025-06-29T12:06:04.0387307Z
2025-06-29T12:06:04.0387532Z #17 [builder 3/5] COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
2025-06-29T12:06:04.0387922Z #17 CACHED
2025-06-29T12:06:04.0388023Z
2025-06-29T12:06:04.0389295Z #18 [deps 5/5] RUN --mount=type=cache,target=/root/.bun/install/cache     --mount=type=cache,target=/app/node_modules/.cache     --mount=type=cache,target=/tmp/better-sqlite3-build     export BETTER_SQLITE3_CACHE_DIR=/tmp/better-sqlite3-build &&     export npm_config_build_from_source=true &&     export npm_config_cache=/app/node_modules/.cache &&     bun install --frozen-lockfile --no-verify
2025-06-29T12:06:04.0391027Z #18 CACHED
2025-06-29T12:06:04.0391129Z
2025-06-29T12:06:04.0391300Z #19 [builder 2/5] COPY --from=deps /app/node_modules ./node_modules
2025-06-29T12:06:04.0391634Z #19 CACHED
2025-06-29T12:06:04.0391732Z
2025-06-29T12:06:04.0391863Z #20 [deps 1/5] COPY package.json bun.lock ./
2025-06-29T12:06:04.0392131Z #20 CACHED
2025-06-29T12:06:04.0392233Z
2025-06-29T12:06:04.0392319Z #21 [builder 4/5] COPY . .
2025-06-29T12:06:04.0392530Z #21 CACHED
2025-06-29T12:06:04.0392627Z
2025-06-29T12:06:04.0393117Z #22 [builder 5/5] RUN --mount=type=cache,target=/app/apps/web/.next/cache     --mount=type=cache,target=/root/.bun/install/cache     cd apps/web &&     bun run build
2025-06-29T12:06:04.0393767Z #22 0.094 $ next build
2025-06-29T12:06:05.2088783Z #22 1.265    ▲ Next.js 15.3.3
2025-06-29T12:06:05.3989488Z #22 1.265    - Experiments (use with caution):
2025-06-29T12:06:05.3990149Z #22 1.265      ⨯ serverMinification
2025-06-29T12:06:05.3990448Z #22 1.265
2025-06-29T12:06:05.3990738Z #22 1.305    Creating an optimized production build ...
2025-06-29T12:06:33.3656852Z #22 29.42  ⚠ Compiled with warnings in 27.0s
2025-06-29T12:06:33.3657253Z #22 29.42
2025-06-29T12:06:33.5207606Z #22 29.42 ../../packages/ui/src/components/index.ts
2025-06-29T12:06:33.5209013Z #22 29.42 The requested module './dialog-premium' contains conflicting star exports for the names 'Dialog', 'DialogClose', 'DialogPortal', 'DialogTrigger' with the previous requested module './dialog'
2025-06-29T12:06:33.5209897Z #22 29.42
2025-06-29T12:06:33.5210137Z #22 29.42 Import trace for requested module:
2025-06-29T12:06:33.5210516Z #22 29.42 ../../packages/ui/src/components/index.ts
2025-06-29T12:06:33.5211070Z #22 29.42 ../../packages/ui/src/index.ts
2025-06-29T12:06:33.5211339Z #22 29.42 ../../packages/ui/index.ts
2025-06-29T12:06:33.5211584Z #22 29.42 ./app/global-error.tsx
2025-06-29T12:06:33.5211801Z #22 29.42
2025-06-29T12:06:33.5212000Z #22 29.42 ../../packages/ui/src/components/index.ts
2025-06-29T12:06:33.5212788Z #22 29.42 The requested module './dialog-premium' contains conflicting star exports for the names 'Dialog', 'DialogClose', 'DialogPortal', 'DialogTrigger' with the previous requested module './dialog'
2025-06-29T12:06:33.5213530Z #22 29.42
2025-06-29T12:06:33.5213722Z #22 29.42 Import trace for requested module:
2025-06-29T12:06:33.5214005Z #22 29.42 ../../packages/ui/src/components/index.ts
2025-06-29T12:06:33.5214288Z #22 29.42 ../../packages/ui/src/index.ts
2025-06-29T12:06:33.5214536Z #22 29.42 ../../packages/ui/index.ts
2025-06-29T12:06:33.5214769Z #22 29.42 ./app/global-error.tsx
2025-06-29T12:06:33.5214982Z #22 29.42
2025-06-29T12:06:33.5215182Z #22 29.42 ../../packages/ui/src/components/index.ts
2025-06-29T12:06:33.5215954Z #22 29.42 The requested module './dialog-premium' contains conflicting star exports for the names 'Dialog', 'DialogClose', 'DialogPortal', 'DialogTrigger' with the previous requested module './dialog'
2025-06-29T12:06:33.5216686Z #22 29.42
2025-06-29T12:06:33.5216873Z #22 29.42 Import trace for requested module:
2025-06-29T12:06:33.5217151Z #22 29.42 ../../packages/ui/src/components/index.ts
2025-06-29T12:06:33.5217423Z #22 29.42 ../../packages/ui/src/index.ts
2025-06-29T12:06:33.5217664Z #22 29.42 ../../packages/ui/index.ts
2025-06-29T12:06:33.5218283Z #22 29.42 ./app/not-found.tsx
2025-06-29T12:06:33.5218493Z #22 29.42
2025-06-29T12:06:33.5218825Z #22 29.43    Skipping validation of types
2025-06-29T12:06:33.5219076Z #22 29.43    Skipping linting
2025-06-29T12:06:33.8168576Z #22 29.87    Collecting page data ...
2025-06-29T12:06:35.3138596Z #22 31.37 Error: DATABASE_URL environment variable is required
2025-06-29T12:06:35.3139396Z #22 31.37     at 52368 (.next/server/chunks/6991.js:384:11)
2025-06-29T12:06:35.3140010Z #22 31.37     at __webpack_require__ (.next/server/webpack-runtime.js:25:43)
2025-06-29T12:06:35.3140587Z #22 31.37     at 61886 (.next/server/app/api/auth/list-accounts/route.js:242:67)
2025-06-29T12:06:35.3141527Z #22 31.37     at __webpack_require__ (.next/server/webpack-runtime.js:25:43)
2025-06-29T12:06:35.3142076Z #22 31.37     at 60360 (.next/server/app/api/auth/list-accounts/route.js:137:19)
2025-06-29T12:06:35.3142616Z #22 31.37     at __webpack_require__ (.next/server/webpack-runtime.js:25:43)
2025-06-29T12:06:35.3143242Z #22 31.37     at __webpack_exec__ (.next/server/app/api/auth/list-accounts/route.js:417:39)
2025-06-29T12:06:35.3143886Z #22 31.37     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:87)
2025-06-29T12:06:35.3144540Z #22 31.37     at __webpack_require__.X (.next/server/webpack-runtime.js:155:21)
2025-06-29T12:06:35.3145044Z #22 31.37     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:47)
2025-06-29T12:06:35.4405587Z #22 31.37
2025-06-29T12:06:35.4406028Z #22 31.37 > Build error occurred
2025-06-29T12:06:35.4406770Z #22 31.38 [Error: Failed to collect page data for /api/auth/list-accounts] {
2025-06-29T12:06:35.4407426Z #22 31.38   type: 'Error'
2025-06-29T12:06:35.4407745Z #22 31.38 }
2025-06-29T12:06:35.4408115Z #22 31.50 error: script "build" exited with code 1
2025-06-29T12:06:35.5075517Z #22 ERROR: process "/bin/sh -c cd apps/web &&     bun run build" did not complete successfully: exit code: 1
2025-06-29T12:06:35.5076331Z ------
2025-06-29T12:06:35.5077266Z  > [builder 5/5] RUN --mount=type=cache,target=/app/apps/web/.next/cache     --mount=type=cache,target=/root/.bun/install/cache     cd apps/web &&     bun run build:
2025-06-29T12:06:35.5078686Z 31.37     at __webpack_exec__ (.next/server/app/api/auth/list-accounts/route.js:417:39)
2025-06-29T12:06:35.5079209Z 31.37     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:87)
2025-06-29T12:06:35.5079683Z 31.37     at __webpack_require__.X (.next/server/webpack-runtime.js:155:21)
2025-06-29T12:06:35.5080149Z 31.37     at <unknown> (.next/server/app/api/auth/list-accounts/route.js:418:47)
2025-06-29T12:06:35.5080512Z 31.37
2025-06-29T12:06:35.5080697Z 31.37 > Build error occurred
2025-06-29T12:06:35.5081338Z 31.38 [Error: Failed to collect page data for /api/auth/list-accounts] {
2025-06-29T12:06:35.5081710Z 31.38   type: 'Error'
2025-06-29T12:06:35.5081921Z 31.38 }
2025-06-29T12:06:35.5082131Z 31.50 error: script "build" exited with code 1
2025-06-29T12:06:35.5082412Z ------
2025-06-29T12:06:35.8495441Z Error: failed to fetch an image or build from source: error building: failed to solve: process "/bin/sh -c cd apps/web &&     bun run build" did not complete successfully: exit code: 1
2025-06-29T12:06:35.8533030Z ##[error]Process completed with exit code 1.
2025-06-29T12:06:35.8623187Z Post job cleanup.
2025-06-29T12:06:35.9538674Z [command]/usr/bin/git version
2025-06-29T12:06:35.9574979Z git version 2.49.0
2025-06-29T12:06:35.9616722Z Temporarily overriding HOME='/home/runner/work/_temp/0f580c9f-bc37-4383-990c-57827080519d' before making global git config changes
2025-06-29T12:06:35.9617677Z Adding repository directory to the temporary git global config as a safe directory
2025-06-29T12:06:35.9622313Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/vtchat/vtchat
2025-06-29T12:06:35.9657003Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2025-06-29T12:06:35.9688729Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2025-06-29T12:06:35.9956205Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2025-06-29T12:06:35.9976174Z http.https://github.com/.extraheader
2025-06-29T12:06:35.9988644Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2025-06-29T12:06:36.0018717Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2025-06-29T12:06:36.0339769Z Cleaning up orphan processes


--
launch discount promo code?

--

https://github.com/vercel/mcp-adapter

--
IMPORTANT verify creem.io LIVE payment
good luck!
https://www.creem.io/checkout/prod_1UZhx15bSgbT8ggWTPQNi/ch_4oVL59zbacFQaBIGrGBgug

--

localization

--

https://docs.creem.io/faq/account-reviews

--

Marketting plan
"better to launch waitlist + DMs first, then do researches, before building and launching

I like the idea of SEO with ChatGPT blogs though"

+ https://www.producthunt.com/
+ https://peerlist.io/
+ https://uneed.best/
+ https://microlaunch.net/


grand final -> show hn, good luck!

-> discuss with Claude.
-> ask for tagline
--

gen new launch image https://og.new/

ref https://x.com/fayazara/status/1820354290487083232
Launch day

https://supersaas.dev/ - A comprehensive Nuxt 3 saas starter kit.

Auth - Email/Password, OTP, Passkey, oAuth
DB - Turso, NuxtHub, Postgres
Email - Resend, Sendgrid, Postmark, Plunk
File storage - S3, R2, Local files
Payments - Stripe & Lemonsqueezy
--
Fayaz Ahmed
@fayazara
·
Aug 5, 2024
Launching it on PH as well - Support appreciated - https://producthunt.com/posts/supersaas-1
--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

--

Write a final readme, documentation, and any other relevant materials to reflect the current state of the project.

--

Future plan
+ Adding username/password login option https://www.better-auth.com/docs/plugins/username
+ forgot password
+ update profile
+ verify email
+ otp email
+ magic link
+ https://supermemory.ai/docs/memory-api/overview
+ mcp

--

Good luck!
