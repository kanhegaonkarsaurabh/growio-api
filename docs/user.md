**Update User Settings**
----
  Update the user notification settings on the app

* **URL**

  /user/settings

* **Method:**

  `PUT`
  
*  **URL Params**

   **Required:**  
  
   `token=[string]` 

* **Data Params**

  **Required**

  `notifications=[Boolen]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
      {
      "data": {
          "__v": 0,
          "_id": "1760644fd0d1dd5b68fad7b3",
          "email": "skanhega@ucsd.edu",
          "gardenId": "5ced0226e31552c93591f6c8",
          "location": {
              "coordinates": [
                  -117.23755359649657,
                  32.88110087702036
              ]
          },
          "name": "Saurabh Kanhegaonkar",
          "settings": {
              "notifications": true
          }
      },
      "msg": "SUCCESS: Successfully updated user: 112437585618234685972 notifications settings to true",
      "success": true
      }
    ```
 
* **Error Response:**

  * **Code:** 404 <br />
    **Content:** 
    ```javascript
        {
      "data": {},
      "msg": "ERROR: notifications param not present on the request body",
      "sucess": false
      }
    ```

* **Sample Call:**

  ```bash
    http PUT https://growio-prod-test.herokuapp.com/users/settings?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTI0Mzc1ODU2MTgyMzQ2ODU5NzIiLCJpYXQiOjE1NTkwNzU5MjgsImV4cCI6MTU1OTA5MDYyOH0.maAWd9cmKsErkC25f8ae7Yv1-m5-NcxVyF-jpFOMCm0 notifications=true
  ```


**Update User Location**
----
  Update the user location from the app onto the database

* **URL**

  /user/location

* **Method:**

  `PUT`
  
*  **URL Params**

   **Required:**  
  
    `token=[string]`

* **Data Params**

  **Required**

  `(Here, Array(a, b) represents an array with Array[0]=a and Array(1)=b)`

  `coordinates=Array(0, 0)`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
      {
        "data": {
          "__v": 0,
          "_id": "1760644fd0d1dd5b68fad7b3",
          "email": "skanhega@ucsd.edu",
          "gardenId": "5ced0226e31552c93591f6c8",
          "location": {
              "coordinates": [
                  0,
                  0
              ]
          },
          "name": "Saurabh Kanhegaonkar",
          "settings": {
              "notifications": null
          }
        },
        "msg": "SUCCESS: Successfully updated user: 112437585618234685972 location to 0,0",
        "success": true
      }
    ```
 
* **Error Response:**

  * **Code:** 404 <br />
    **Content:** 
    TBD

* **Sample Call:**

  ```bash
    http PUT https://growio-prod-test.herokuapp.com/users/location?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTI0Mzc1ODU2MTgyMzQ2ODU5NzIiLCJpYXQiOjE1NTkwNzU5MjgsImV4cCI6MTU1OTA5MDYyOH0.maAWd9cmKsErkC25f8ae7Yv1-m5-NcxVyF-jpFOMCm0 coordinates:='[0, 0]'
  ```

