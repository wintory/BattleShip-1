# Battleship Assignment

### Prerequisites

You need to install [NodeJS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/)

### Installing

Installing node module

```
npm i
```

### Setting server config

Setting server config at `config.json`
#### Database config
```json
"Database": {
        "ip": "localhost",
        "port": "27017",
        "user": "battleship",
        "password": "battleship_very_secure_password",
        "database": "battleship"
    },
```
#### API config
```json
"api": {
        "port": 3000
    }
```

#### Game config

You can change your game config such as ocean size, ship size, ship amount, etc....

```json
"game": {
        "size": 10,
        "ship_data": [
            {
                "name": "Battleship",
                "amount": 1,
                "size": 4
            },
            {
                "name": "Cruisers",
                "amount": 2,
                "size": 3
            },
            {
                "name": "Destroyers",
                "amount": 3,
                "size": 2
            },
            {
                "name": "Submarines",
                "amount": 4,
                "size": 1
            }
        ]
    }
```

## Running the tests

Runing the automated tests

```
npm run test
```

## How to play

In the beginning, you must start your first game by request to `/game/new`, after that you can choose position to shoot in match by request to `/game/shoot/:x/:y`.
The response will tell you if it hit or miss or you just sank the ship.

You can check your shoot history of current match by request to `/game/shoot/history` or check match history `/game/match/history`.

Also if you want to check your stats you can request to `/stats`. The response will show only win,hit,miss and sunk.

If you want to delete your playing data you must request to `/game/deactive`.

You can't request new game if your last game not ending yet. If you want to request new game you must give up on your last match by
request to `/game/giveup` to give up your last match.

Do not share your player name to anyone, or other player can play your game or deactive your data.



## Documents

**Start new game**
----
  Returns result as json data.

* **URL**

  /game/new

* **Method:**

  `POST`
  
*  **URL Params**

   **Required:**
 
   None
* **Data Params**

  `player_name` : player name

* **Success Response:**

  * **Code:** 201 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "message": "New game succesful !."
    }
    ```
 
  OR
  * **Code:** 200 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "You not finish your last match yet. "
    }
    ```
    
* **Sample Call**
Javascript
  ```javascript
    $.ajax({
      url: "/game/new",
      dataType: "json",
      method : "POST",
      data: {
        "player_name": "your_name"
      }
      success : function(r) {
        console.log(r);
      }
    });
  ```
    Shell
  ```shell
    curl --request POST \
      --url http://localhost:3000/game/new \
      --data player_name=your_name
  ```

**Give up**
----
  Returns result as json data.

* **URL**

  /game/giveup

* **Method:**

  `POST`
  
*  **URL Params**

   **Required:**
 
   None
* **Data Params**

  `player_name` : player name

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "message": "You just give up on your last match !."
    }
    ```
 
  OR
  * **Code:** 200 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "You have no playing match."
    }
    ```
    
* **Sample Call**
    Javascript
  ```javascript
    $.ajax({
      url: "/game/giveup",
      dataType: "json",
      method : "POST",
      data: {
        "player_name": "your_name"
      }
      success : function(r) {
        console.log(r);
      }
    });
  ```
  Shell
  ```shell
    curl --request POST \
      --url http://localhost:3000/game/giveup \
      --data player_name=your_name
  ```

**Deactive player**
----
  Delete player data and returns result as json data.

* **URL**

  /game/deactive

* **Method:**

  `DELETE`
  
*  **URL Params**

   **Required:**
 
   None
* **Data Params**

  `player_name` : player name

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "message": "Delete player successful !."
    }
    ```

* **Error Response:**

  * **Code:** 404 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "Player name doesn't exist."
    }
    ```
    
* **Sample Call**
    Javascript
  ```javascript
    $.ajax({
      url: "/game/deactive",
      dataType: "json",
      method : "DELETE",
      data: {
        "player_name": "your_name"
      }
      success : function(r) {
        console.log(r);
      }
    });
  ```
  Shell
  ```shell
    curl --request DELETE \
      --url http://localhost:3000/game/deactive \
      --data player_name=your_name
  ```
  
  
**Shooting**
----
  Returns result as json data.

* **URL**

  /game/shoot/:x/:y

* **Method:**

  `POST`
  
*  **URL Params**

   **Required:**
 
   `x=[integer]` : position of x
   `y=[integer]` : position of y
* **Data Params**

  `player_name` : player name

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "message": "Miss"
    }
    ```
    OR

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "message": "Hit"
    }
    ```
    OR

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "message": "Win ! You completed the game in 3 moves",
        "win": {
            "turns": 3
        }
    }
    ```
    OR
    
  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": false,
        "message": "Shoot position over map !. You must shoot between (0,0) till (9,9)"
    }
    ```
    
    OR
    
  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": false,
        "message": "The position (8,4) already shooted."
    }
    ```
  
* **Error Response:**
  * **Code:** 404 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "Match playing not found."
    }
    ```
    
    OR
    
  * **Code:** 404 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "Player not found."
    }
    ```
    
* **Sample Call**
    Javascript
  ```javascript
    $.ajax({
      url: "/game/shoot/7/1",
      dataType: "json",
      method : "POST",
      data: {
        "player_name": "your_name"
      }
      success : function(r) {
        console.log(r);
      }
    });
  ```
  Shell
  ```shell
    curl --request POST \
      --url http://localhost:3000/game/shoot/7/1  \
      --data player_name=your_name
  ```

**Get shoot history of current match**
----
  Returns result as json data.

* **URL**

  /game/shoot/history

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   None
* **Data Params**

  `player_name` : player name

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "history": [
            {
                "x": 7,
                "y": 1,
                "hit": false,
                "time": "2018-03-10T14:24:06.724Z"
            } , ...
        ]
    }
    ```

* **Error Response:**

  * **Code:** 404 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "Shoot history not found."
    }
    ```
    
    OR
  * **Code:** 404 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "Player not found."
    }
    ```
    
* **Sample Call**
    Javascript
  ```javascript
    $.ajax({
      url: "/game/shoot/history?player_name=your_name",
      dataType: "json",
      method : "GET",
      data: {
        "player_name": "your_name"
      }
      success : function(r) {
        console.log(r);
      }
    });
  ```
  Shell
  ```shell
    curl --request GET \
      --url http://localhost:3000/game/shoot/history?player_name=your_name \
      --data player_name=your_name
  ```

**Get match history**
----
  Returns result as json data.

* **URL**

  /game/match/history

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   None
* **Data Params**

  `player_name` : player name

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {
        "status": true,
        "history": [{
            "turn": 7,
            "ship_left": 9,
            "ending": true,
            "shooted": [
                {
                    "x": 1,
                    "y": 5,
                    "hit": false,
                    "time": "2018-03-10T08:45:49.791Z"
                } , ...],
            "ships": [
                {
                    "id": 1,
                    "ship_name": "Battleship",
                    "sunk": true
                } , ...],
            "ocean": [
                {
                    "x": 4,
                    "y": 7,
                    "ship_id": 1,
                    "hit": true
                } , ...]
            } , ... ]
    }    
    ```
* **Error Response:**
  * **Code:** 404 <br />
    **Content:**      
    ```json
    {
        "status": false,
        "message": "Player not found."
    }
    ```
    
* **Sample Call**
    Javascript
  ```javascript
    $.ajax({
      url: "/game/match/history?player_name=your_name",
      dataType: "json",
      method : "GET",
      data: {
        "player_name": "your_name"
      }
      success : function(r) {
        console.log(r);
      }
    });
  ```
  Shell
  ```shell
    curl --request GET \
      --url http://localhost:3000/game/match/history?player_name=your_name \
      --data player_name=your_name
  ```
  
## Built With

* [NodeJS](https://nodejs.org/en/)
* [MongoDB](https://www.mongodb.com/)

## Authors

* **Wasawat Lertjankhajorn** - [yacth_Mon](https://github.com/yacthMon)
