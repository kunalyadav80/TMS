
## API Reference

#### Initializing Transaction

```http
  POST /api/pay
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name` | `string` | Customer Name |
| `phone` | `string` | Customer Phone |
| `email` | `string` | Customer Email |
| `amount` | `int` | Amount in Rupees |


#### Redirecting Payment URL

```http
  GET /redirect?url=
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `url`      | `string` | **Required** |

#### Checking Transaction Status
This is Used For Checking Transaction Status and Returns Success and Fail HTML Page.
```http
  GET /api/check?data=
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `data`      | `string` | **Required** |


#### Server To Server Callback
This Route is Called By PhonePe API. It is Used For Checking Transaction Status and Sending Email and Telegram Notification.
```http
  GET /api/status?data=
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `data`      | `string` | **Required** |



#### Client IP Info

```http
  POST /api/clientinfo
```
This Path Returns Client Information in JSON.
| Parameter | Type     |
| :-------- | :------- |
| `ip`      | `string` |
| `isp`      | `string` |
| `city`      | `string` |

#### Invoice URL

```http
  GET /api/invoice?data=
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `data`      | `string` | **Required** |


#### Invoice POST Route For Password

```http
  POST /api/invoice?data=
```
Returns HTML Code For Invoice on Correct Password

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `data`      | `string` | **Required Param** In URL |
| `password`  | `string` | **Required** In Body Data |
