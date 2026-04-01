# SOP 下发系统完整开发方案

本方案基于 **Node.js (NestJS) + Vue3 (Element Plus) + MySQL** 架构，严格遵循 RESTful 风格和模块化原则，从端到端描述了整个 SOP 下发系统的设计规范、业务逻辑及落地实现细节。

## 1. 需求分析
**业务背景**：现场生产终端需要通过固定链接访问当前工站的 SOP（标准作业指导书）。
**核心诉求**：
- 识别并记忆终端所在工站。
- 以 PDF 格式严格渲染 SOP 文档，支持以第0页作为封面的页码逻辑。
- 具备反馈及邮件发送的异常补偿能力。
- 完整的后台管理能力（权限、版本、日志、终端控制）。
**技术约束**：全栈 Node+Vue，国产化/中文语境，所有文案及注释必须使用中文，严格的页码映射规则。

## 2. 总体架构设计
本系统采用前后端分离，但在项目组织上建议采用 Monorepo 体系（或统一代码库下的分开目录）以便于管理。

- **后端层**：**Node.js + NestJS**
  - **原因**：NestJS 提供开箱即用的企业级架构，通过装饰器和依赖注入规范代码，利于长期维护。
- **前端层**：**Vue3 + Vue Router + Pinia + Element Plus**
  - **核心库**：`pdf.js` 用于原生级 PDF 页面渲染（通过 canvas）。
- **数据库**：**MySQL 8.0+**
- **ORM 框架推荐**：**Prisma**
  - **理由**：相较于 TypeORM，Prisma 是下一代 ORM。它的 schema 声明式设计极其清晰，能自动生成强类型的 TypeScript 客户端，减少 SQL 查询过程中的类型错误。同时它的数据库迁移（Migration）机制对于处理本项目中多表关联（尤其是多对多权限、工站终端绑定）非常安全高效。
- **文件存储**：**Node 本地静态文件代理**（开发简单，容易私有化部署）。
- **邮件服务**：基于 **Nodemailer** 的 SMTP 发送，结合异步队列保证高可用。

## 3. 功能模块清单
| 模块名称 | 子功能描述 |
| :--- | :--- |
| **终端展示模块** | 工站选择（首次访问）、封面展示、PDF只读浏览（翻页/缩放/跳页）、问题反馈表单提交。 |
| **基础配置模块** | 用户管理、角色管理、权限菜单管理、系统基础参数配置、封面页背景与参数配置。 |
| **资源管理模块** | 工站定义与维护、终端设备资产管理与工站绑定解绑。 |
| **SOP 管理模块** | SOP PDF文件上传、版本控制（当前生效/历史版本）、上下线发布控制、PDF页数自动解析。 |
| **运维监控模块** | 反馈记录查询、邮件发送日志查询与失败手动补发、用户操作日志、登录日志查询。 |

## 4. 页面结构设计
整个系统前台与中后台分离为两个路由命名空间，终端页面需适配触摸屏操作。

### 终端页面（展示端）
1. **工站选择页 (`/station-select`)**：首次进入未绑定工站时强制展示。提供清晰的下拉或平铺按钮选择当前终端对应的工站。
2. **封面页 (`/cover`)**：显示系统名称大字标、当前工站名称、当前生效SOP版本。提供“进入 SOP”、“切换工站”、“反馈问题”大按钮。
3. **SOP PDF展示页 (`/sop-view`)**：
   - **顶部区域**：左侧显示系统与工站名称，右侧固定“返回封面”、“切换工站”、“反馈”按钮（尺寸适宜触摸）。
   - **中间区域**：占满屏幕主体区域的 PDF Canvas 渲染区，支持触摸屏双指缩放、拖拽。
   - **底部区域**：大型翻页控件。包含上一页、下一页按钮，中间显示 `当前页码 / 总页数`，支持点击数字唤起数字键盘输入指定页码跳转。
4. **反馈弹窗/独立页 (`/feedback`)**：简洁的表单，填写反馈人、联系方式、反馈类型（下拉框）、具体内容。背景带入当前工站和页码。
5. **异常提示页 (`/error`)**：网络断开、工站被管理员停用、SOP尚未发布或已下线等异常状态的统一提示页面，提供返回或重试按钮。

### 后台管理页面（管理端 `/admin/*`）
6. **登录页**：后台管理员账号密码登录，带图形验证码。
7. **工站管理页**：列表维护工站信息（增删改查），配置封面参数。
8. **终端管理页**：查看各终端设备指纹（UUID）、最后活跃时间、绑定的工站情况，支持强制解绑。
9. **SOP管理页**：按工站维度管理 SOP 主文书。
10. **SOP版本管理与上传页**：支持拖拽上传 PDF 文件，后端自动解析并展示页数，支持多版本并存及点击“发布”（切换生效标记）。
11. **反馈记录页**：列表展示用户反馈的数据，包含关联的工站、页码详情，并显示对应邮件的发送状态。
12. **邮件发送记录页**：专项审计邮件投递情况，高亮失败记录，并提供“操作：重新发送”按钮。
13. **用户管理页**：管理后台运维账号及分配的角色。
14. **角色权限页**：配置角色所拥有的系统菜单权限及接口操作权限。
15. **日志查询页**：分为操作日志页签（记录增删改）与登录日志页签。
16. **系统配置页**：配置发件邮箱 SMTP 服务器参数、企业名称等全局参数。

## 5. 页面跳转流程说明
系统针对终端进入设置了严格的路由守卫（Router Guard），核心跳转流程如下：

```text
终端访问统一根路径 ( / )
  │
  ├─ 读取本地 LocalStorage，检查是否存在 [终端标识UUID] 与 [工站ID]
  │
  ├─ 【情况A：无 工站ID】(表示从未绑定过)
  │    └─ 自动跳转 ➔ 工站选择页 (/station-select)
  │         └─ 用户选择工站并确认 ➔ 调接口保存绑定关系 ➔ 写入 LocalStorage ➔ 跳转 封面页 (/cover)
  │
  ├─ 【情况B：有 工站ID】
       └─ 前端携带标识请求后端，校验该工站是否有效且有生效的 SOP
            ├─ [状态正常] ➔ 跳转 ➔ 封面页 (/cover)
            │         └─ 用户点击“进入”按钮 ➔ 跳转 ➔ SOP PDF展示页 (/sop-view，默认加载第0页封面)
            │
            ├─ [工站停用 / 无生效SOP / SOP被下线] 
            │         └─ 跳转 ➔ 异常提示页 (/error，显示对应明确的中文字段提示，并提供“切换工站”按钮)
```

## 6. 终端记忆工站方案设计

为满足“同一终端固定使用、操作简单（无需重复登录）、误切换风险低、带灾备能力”的原则，评估以下方案：
1. _LocalStorage 方案_：前端本地存储，简单，但清缓存会丢失。
2. _Cookie 方案_：与 LocalStorage 类似，多用于带状态会话。
3. _终端编号绑定（MAC/IP）_：网页端无法获取真实 MAC，IP 在 DHCP 环境下变动频繁，维护成本极高。
4. _登录账号方案_：需要操作员每次输入密码登录，操作繁琐，不符合终端即开即用需求。

**最终推荐方案：前端 UUID 结合 LocalStorage 与 后端轻量级白名单校验方案**

- **具体设计**：
  1. **首次指纹生成**：终端首次打开系统，前端自动生成一个唯一的 UUID（如 `v4()` uuidv4），永久存入 `LocalStorage['terminal_id']`，作为该设备的唯一“指纹”。
  2. **用户首次选择**：进入工站选择页，用户手动指派该终端为“组装工站A”，点击确定。前端将 `terminal_id` 与 `station_id` 提交给后端保存至 `终端工站绑定表`。前端也将 `station_id` 写入 `LocalStorage`。
  3. **后续免扰访问**：以后每次访问，前端路由带着这两个信息静默向后端校验。只要后台未主动解绑该 UUID，即直接渲染对应工站的封面。
  4. **极强容灾性**：即使网络短暂波动，前端也能基于 LocalStorage 里的缓存标识，先画出封面页UI框架，待网络恢复后加载PDF，不会白屏。如果误切，只能通过界面上的【切换工站】按钮，弹出二次确认框并需记录日志。

## 7. SOP PDF 展示方案设计

为防范富文本难以控制格式的问题，SOP 必须且只能是原生 PDF。

- **核心渲染库**：采用 Mozilla 开源的 **`pdf.js`**。禁止使用 `<iframe>` 或 `<embed>`（因其无法精细控制翻页与拦截触摸事件）。
- **组件封装策略**：
  - 将 `pdf.js` 封装成一个 Vue3 的 `<PdfViewer />` 自定义组件。
  - 后端接口直接返回 PDF 文件的二进制流或静态资源直链。
  - 组件内部挂载 `<canvas>` 节点。根据当前页码变量，调用 `pdfDoc.getPage(pageNumber).then(page => page.render(renderContext))` 将页面绘制到画布上。
- **触摸屏适配设计**：
  - **缩放**：监听 Canvas 上的由 `touchstart` 到 `touchmove` 构成的 pinch (双指捏合) 手势，动态调整 `viewport.scale` 重新 render。
  - **翻页操控区**：底部固定高度 `80px` 的控制条，放置大号的“上一页”、“下一页”文字按钮。增加侧滑（左滑右滑）屏幕全局手势也触发翻页增减。
  - **全屏功能**：提供右上角“全屏”按钮，利用 HTML5 `requestFullscreen()` API 隐藏系统通知栏与浏览器地址栏，实现沉浸式展示。

## 8. PDF 页数识别与 0-20 页逻辑设计

此需求是本系统的特殊业务规则，需在上传与展示环节做专门映射。

**1. 后端自动识别页数（上传环节）：**
当管理员在上传 PDF 到接口 `/api/v1/admin/sop/upload` 时，后端在内存中使用 Node.js 库 `pdf-parse` 分析该文件流。
获取其真实的**物理总页数**（假设为 `21`），并将其毫无保留地存入数据库 `sop_files` 表的 `total_pages` 字段。

**2. 前端 0 到 N 映射逻辑（展示环节）：**
必须处理好【PDF物理原始页序】与【业务展示页码】的转换关系。

- **页数展示换算**：总业务页数 = `total_pages - 1` （例如 21 -> 20）。
- **页面选择范围**：前端底部能够选择和跳转的范围是 `0` 至 `20`。
- **当前为 0 页（封面页）的处理**：
  - 当业务状态值 `currentPage === 0` 时。
  - 显示区域：底部文字显示【封面页 / 共 20 页】（代替了原本的 0/20）。
  - 传参给 `pdf.js`：由于 pdf.js 底层只认识 1 开始的物理页码，因此传值必须是 `currentPage + 1` 即 `1`。`pdf.js` 会把这个 PDF 文档的第 1 页物理页画在画布上。
- **当前为正文页（1 至 20 页）的处理**：
  - 当业务状态值 `currentPage === N (1 <= N <= 20)` 时。
  - 显示区域：底部文字正常显示【当前第 N 页 / 共 20 页】。
  - 传参给 `pdf.js`：传值同样是 `currentPage + 1` 即 `N + 1`。比如选择业务页码 1，底层渲染该 PDF 的物理第 2 页。

## 9. 数据库表设计（字段级）
系统将采用强外键或业务逻辑关联，以下为核心表结构设计（下述所有类型基于 MySQL 语境）：

| 表名 (Table) | 中文说明 | 核心字段定义与中文注释 |
| :--- | :--- | :--- |
| **`users`** | 用户表 | `id` (主键), `username` (登录账号), `password` (加密密码), `real_name` (真实姓名), `status` (状态: 1启用 0禁用) |
| **`roles`** | 角色表 | `id`, `role_code` (角色标识,如 ADMIN), `role_name` (角色名称) |
| **`permissions`** | 权限表 | `id`, `menu_code` (菜单/组件唯一标识), `name` (权限说明) |
| **`user_role_bind`**| 用户角色关联表 | `user_id`, `role_id`联合主键 |
| **`stations`** | 工站表 | `id`, `station_code` (工站唯一编号), `name` (工站名称), `status` (1启用 0停用), `sort` (排序) |
| **`terminals`** | 终端设备表 | `id`, `terminal_uuid` (前端生成的唯一指纹), `ip_address` (记录的IP), `last_active_time` (最后通讯时间) |
| **`terminal_station`**| 终端工站绑定表 | `id`, `terminal_id` (终端表外键), `station_id` (工站表外键), `bind_time` (绑定时间) |
| **`sop_main`** | SOP主表 | `id`, `station_id` (归属工站外键), `sop_code` (SOP文件编码), `name` (SOP名) |
| **`sop_versions`** | SOP版本表 | `id`, `sop_id` (主表外键), `version_no` (版本号如V1.0.1), `status` (状态: 0草稿 1生效 2已下线), `is_active` (当前生效版本标记 0否 1是) |
| **`sop_files`** | SOP PDF文件表 | `id` (主键), `version_id` (关联版本表), **`file_path`** (PDF文件存储路径), **`original_name`** (PDF原始文件名), **`total_pages`** (PDF物理总页数), **`is_zero_indexed`** (封面页是否按第0页处理，默认1), `file_size` (大小, kb) |
| **`cover_configs`** | 封面配置表 | `id`, `station_id` (归属工站), `background_img` (背景图URL), `main_title` (自定义封面大字), `prompt_text` (提示语) |
| **`feedbacks`** | 反馈表 | `id`, `station_name` (工站名称), `terminal_uuid` (发起终端), `submitter` (反馈人), `contact` (联系方式), `type` (反馈类型), `content` (具体问题描述), `sop_name` (当时SOP名称), `sop_version` (当时版本), `page_no` (出问题时停留在第几页), `mail_status` (发件状态 0未发 1成功 2失败), `create_time` |
| **`feedback_files`**| 反馈附件表 | `id`, `feedback_id` (外键), `file_path` (图文附件地址) |
| **`mail_logs`** | 邮件发送记录表 | `id`, `feedback_id` (关联的反馈ID), `receiver_email` (收件人邮箱), `send_time` (实际触发时间), `status` (当前状态: 1成功 0失败), `fail_reason` (长文本，存储抓取到的 SMTP 失败堆栈报错) |
| **`sys_logs`** | 操作/登录日志表 | `id`, `action_type` (登录、新增、删除等), `operator_name` (操作人员), `content` (涉及模块和数据痕迹), `ip`, `create_time` |
| **`sys_configs`** | 系统全局配置表 | `id`, `config_key` (键名，如 SMTP_HOST), `config_value` (值), `remark` (中文解释说明) |

## 10. API 接口设计
*所有接口均采用 RESTful 设计标准，统一返回 `{ code: 200, data: {...}, message: "成功" }` 格式。*

1. **终端类接口 (展示端使用，依赖 Header 中的 UUID 取代 Token)**
   - `GET /api/v1/terminal/binding`
     - 请求参数：`?terminalId={uuid}`
     - 返回参数：`{ isBound: true, station: { id, name, code, status } }`
     - 说明：获取当前终端绑定工站。
   - `POST /api/v1/terminal/binding`
     - 请求参数：`Body { terminalId: "uuid", stationId: 10 }`
     - 说明：保存当前终端工站。如果已绑定则报错（切换需调专用接口）。
   - `POST /api/v1/terminal/switch`
     - 请求参数：`Body { terminalId: "uuid", newStationId: 15 }`
     - 说明：强制切换工站，生成解绑和重绑日志。
   - `GET /api/v1/station/:id/cover`
     - 返回参数：` { backgroundImg, mainTitle } `
     - 说明：获取封面页配置。
   - `GET /api/v1/station/:id/active-sop`
     - 返回参数：`{ sopName, versionNo, filePath, totalPages, isZeroIndexed }`
     - 说明：点击封面进入时调用，获取当前工站正在生效的那个版本的 SOP 详细信息及 PDF 路径。
   - `POST /api/v1/feedback`
     - 请求参数：`Body { stationName, submitter, contact, type, content, pageNo, ... }`
     - 说明：只由终端提交反馈数据。

2. **管理类接口 (需携带 Admin Authorization Bearer Token)**
   - `POST /api/v1/admin/login` / `POST /api/v1/admin/logout` (登录与退出)
   - `GET /api/v1/admin/stations` (获取工站列表带分页搜索)
   - `GET /api/v1/admin/stations/:id` (获取工站详情)
   - `POST /api/v1/admin/sop/upload`
     - 请求参数：`multipart/form-data` 上传 file
     - 返回参数：`{ filePath, originalName, totalPages }`
     - 说明：自动识别 PDF 总页数的上传接口。
   - `POST /api/v1/admin/sop/publish`
     - 请求参数：`Body { sopId, versionId }`
     - 说明：发布 SOP，将目标版本 `is_active` 置1，同 SOP 其它版本置0。
   - `POST /api/v1/admin/sop/offline` (下线特定SOP，让终端看无SOP提示页)
   - `GET /api/v1/admin/feedbacks` (查询反馈记录列表带查询条件)
   - `GET /api/v1/admin/mail-logs` (查询邮件发送记录)
   - `POST /api/v1/admin/mail-logs/:id/retry`
     - 说明：失败邮件重发/补发专用补偿接口。
   - (用户管理、角色管理、终端管理及日志等CRUD接口略)。

## 11. 权限矩阵

| 模块或动作权限点 | 超级管理员 | 业务管理员 | 审核员（可选）| 终端操作员 |
| :--- | :---: | :---: | :---: | :---: |
| **系统前台 - 选择或切换工站** | √ (测试) | √ (测试) | × | **√** |
| **系统前台 - 查看SOP与提交反馈**| √ (测试) | √ (测试) | × | **√** |
| **后台 - 系统与用户/角色管理** | **√** | × | × | × |
| **后台 - 工站与终端资产管理** | **√** | **√** | × | × |
| **后台 - 上传与测试 SOP 版本** | **√** | **√** | × | × |
| **后台 - 发布/下线 生效SOP** | **√** | × (无权发布) | **√ (负责终审)**| × |
| **后台 - 配置专属封面** | **√** | **√** | × | × |
| **后台 - 查看反馈与重发邮件** | **√** | **√** | **√** | × |

## 12. 反馈与邮件失败补偿机制方案

这是确保现场问题能100%传递至工程人员的关键流程设计：

1. **全异步解耦流程**：
   - 用户在页面点击提交反馈。
   - 后端控制器接收后，开启数据库事务：将反馈信息写入 `feedbacks` 表（`mail_status` 设为 0：未发送），将附件信息写入 `feedback_files` 表。事务提交成功。
   - 立即向前端返回HTTP 200 响应：“反馈提交成功，感谢使用”。前端业务结束。
2. **后台队列触发发送**：
   - 后端在事务结束后，向 NestJS 的系统事件总线（Event Emitter）发送一个 `mail.send` 异步事件。
   - 监听器截获事件，利用 Nodemailer 组装包含完整反馈信息（使用 HTML 模板：`所属工站、页码、反馈内容极其附件链接`）的邮件，尝试向邮箱服务器（SMTP）投递验证。
3. **失败拦截与持久化记录**：
   - 【成功分支】更新 `feedbacks` 原记录的发送状态为 1。插入一条 `mail_logs` 状态为成功。
   - 【失败分支】比如网络抖动、邮箱配置错误、鉴权失败。Catch 捕获到异常（Error）。
   - 系统立刻将 `feedbacks.mail_status` 标记为 2（发送失败）。
   - 在 `mail_logs` 表插入一条状态为 0（失败）的记录，并将 Error 的 Message 与 StackTrace 转存入 `fail_reason` 字段。
4. **人工界面补偿（核心）**：
   - 管理员在“邮件发送记录”或“反馈记录”页能清楚看到红色的“发送失败”警示标签及原因说明。
   - 若是配置问题，管理员去系统配置改好发件密码；若是网络暂时不良，管理员直接点击行尾的 **[重新补发]** 按钮。
   - 调取补发 API (`/api/v1/admin/mail-logs/:id/retry`)，后端提取原始反馈内容重行组装并再次投递。投递成功则双表状态刷新闭环。

## 13. 异常场景处理细节

本系统对端侧稳定要求极高，以下场景要求做降级或提示处理：
1. **网络极其不好 / 暂时断网**：
   - 正在阅读的该工站的终端不强制踢出屏幕。
   - 点击翻页遇到断线，弹出居中小面板：“📄当前网络连接丢失，文档片段加载失败，请检查网络后重试。”（不覆盖底层原有已读页面内容）。
2. **后管强行删除了版本 / 停用了当前工站**：
   - 终端内部通过定时器（如每 1 分钟）或翻页切入的空隙发生请求。发现状态码返回为【工站不可用】或者【版本失效】。
   - 前端强制清除已渲染的 Canvas，通过 Router 跳转至 `/error` 页面，显著呈现大字报错：“当前工作站已被停用（或 当前 SOP 版本已更新），请返回封面刷新最新内容。”，并提供唯一一个蓝色安全操作按钮 [返回首页]。
3. **PDF 底层严重毁损解析崩溃**：
   - `pdf.js` 在 `getPage()` 的 Promise 若触发 rejected 异常，统一拦截该异常。
   - 页面中间渲染灰色无数据占位符，提示文字：“PDF源文件似乎已损坏，请点击右上方反馈按钮将此情况报告给系统管理员。”

## 14. 代码目录结构（一体化工程规范要求）
推荐在同一工程空间内存放前后两者（例如 `/frontend` 与 `/backend` 结构清晰并立）。

```text
ProjectRoot/
├── frontend/                       # Vue3 终端与管理前端一体化项目
│   ├── src/
│   │   ├── api/                    # 拦截器与 Axios 接口封装 (分 admin 与 client 目录)
│   │   ├── assets/                 # 全局CSS、基础图标图片
│   │   ├── components/             # 公共组件 (必须包含 PdfViewer.vue)
│   │   ├── router/                 # 路由配置及守卫规则
│   │   ├── store/                  # Pinia 状态管理 (存储临时工站、字典)
│   │   ├── views/                
│   │   │   ├── terminal/           # 终端使用页面 (选择器、SopView核心页、Cover封面页)
│   │   │   └── admin/              # 后端管理端增删改查页面群
│   │   └── utils/                  # 工具类：终端UUID生成器等
│   └── package.json
└── backend/                        # NestJS 基于 TypeScript 的强大后端项目
    ├── prisma/
    │   ├── schema.prisma           # ★ Prism 表结构申明中心
    │   └── migrations/             # 数据库自动生成的变动记录历史
    ├── src/
    │   ├── common/                 # 全局统一异常过滤器、日志中间件、鉴权守卫
    │   ├── modules/              
    │   │   ├── terminal-api/       # 供无需高鉴权设备端使用放行的 Module
    │   │   ├── admin-sop/          # SOP 文档管理与物理实体页数拦截解析 Module
    │   │   ├── admin-station/      # 工站资产数据字典 Module
    │   │   └── mailer-feedback/    # 邮件发送闭环与反馈接收异步 Module
    │   ├── main.ts                 # 服务启动总入口
    │   └── app.module.ts         
    ├── uploads/                    # (非容器独立存储时的默认挂载点) PDF等文件存储处
    └── package.json
```

## 15. 核心代码框架示例 (中文注释)

**A. 后端上传解析（NestJS 中提取总页数）**
```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as pdfParse from 'pdf-parse'; // 注意项目中 npm install pdf-parse

@Controller('api/v1/admin/sop')
export class SopController {
  
  /**
   * 接口说明：管理员上传 SOP PDF 文件并自动获取物理页数总额
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSopPdf(@UploadedFile() file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new Error('抱歉参数类型错误：系统要求上传标准 PDF 格式文件！');
    }
    
    // 1. 读取存在内存中上传完的 Buffer 后传递给库进行处理
    const pdfData = await pdfParse(file.buffer);
    const totalPhysicalPages = pdfData.numpages; // 此行直接得到物理PDF文件的真实页码数量
    
    // 2. 以下为模拟将文件写入到本地临时文件存储内 (本套MVP机制直接存在项目子级)
    const secureFileName = Date.now() + '.pdf';
    const filePath = `/uploads/sops/${secureFileName}`;
    // TODO: fs.writeFileSync(...)
    
    // 3. 将其原样打回给前端让进行确认和下步保存提交
    return {
      filePath,
      originalName: file.originalname,
      totalPages: totalPhysicalPages,
    };
  }
}
```

**B. 前端 PDF 及 0页算法计算控制渲染（Vue3 Setup）**
```javascript
// 注意：以下是前端位于 components/PdfViewer.vue 的核心业务逻辑
import { ref, computed } from 'vue';

// props.backendTotalPages 是来自后端当时返回并被数据库存储物理页数字段
const props = defineProps(['backendTotalPages']); 

// 界面上展示计算出来的最终用户感知的总个数 （因封面消耗了物理第1个底片，故相减）
const displayTotalPages = computed(() => props.backendTotalPages - 1);

// 此时终端正在查阅的由“下/上页”等控制的业务层面虚拟标号页（系统规定始发是0页）
const currentBusinessPage = ref(0); 

/**
 * 绘图核心方法并联接到底层 pdf.js 上
 */
async function renderPage(businessPageNum) {
  // ■ 关键映射桥：由于底层 js 库读取不支持以 0 索引。它只支持 >0。 
  // 必须在此加回偏移量 1；（例如看系统封皮0页时：它实际上就是把第1页抽出来去 Canvas 化）
  const realPdfPageNum = businessPageNum + 1; 
  
  try {
    const page = await pdfDoc.value.getPage(realPdfPageNum);
    // ... 此处忽略设定 scale 与 getContext('2d') 等进行填充 render 的冗长片段
  } catch (error) {
    console.error('非常抱歉，页面当前结构渲染发生了失败', error);
  }
}
```

## 16. 开发优先级建议 (面向项目管控)

系统落地推荐依循三大阶段进行递进发布：

- **阶段一 (Sprint 1) - 核心展示链路攻坚篇 (P0)：**
  跑通后端通过 NestJS 解析 PDF 及获取其页数；跑通前端使用 `pdf.js` 把指定的文件以及能响应 `0-20` 的页面正确无误地平铺渲染在界面上；实现工站录入与首次通过 UUID 选择记住站名的简陋模型。该阶段结束即意味着能够用起来了。
  
- **阶段二 (Sprint 2) - 后台管理与监控补齐篇 (P1)：**
  开发完善的版本上下线替换逻辑。把异常工站拦截（切至错误页）、完整的用户登录及鉴权管理（不同角色对页面的锁定）挂载上去。确保资产管理有迹可寻并且前端能正常提报【异常反馈单据】成功落库。
  
- **阶段三 (Sprint 3) - 收尾与异常补偿容错篇 (P2)：**
  全面补齐 SMTP 邮箱触发异步队列和失败手动捕获干预的机制。完善整个系统的中文字符边界测试、全站各个接口操作痕迹日志落库；UI/UX 改进行动端的“平顺滑屏与双指灵敏度缩放打磨”。

## 17. MVP 最小可用版本方案与集成部署意见

为了减少投入快速测试本管理机制行不行得通。请研发团队进行架构“瘦身”降级落实**最小可用 MVP**：
1. **舍弃微服务与中间件设想：** 不要使用云 OSS/Minio，不用 Redis，不用 RabbitMQ 等重量级件。
2. **极简静态部署：** 要求采用 `Node.js 本地文件系统挂载映射` 当作图床和文件存储库提供服务。
3. **取消动态发件队列：** 发送邮件时，直接在同步 Controller 中 `await transport.send()`。若它报错连接超时，让 `REST API` 直接通过 `try/catch` 捕捉后并反馈给客户端，前台自己弹出：“当前邮件线路忙未能发出，我们已在系统暂存，请稍后再查。” 即可省出海量异步架构排雷时间。
4. **集成部署形式：** 把写好的 Vue3 打包成 `dist/`，直接放入 NestJS 的 `public/` 目录下利用 `ServeStaticModule` 模块统一一个主进程托出。做到“一个执行档一个控制台窗口就能搞定整套下发系统的交付”。
