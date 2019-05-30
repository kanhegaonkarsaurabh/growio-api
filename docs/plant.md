**Plant of the Week**
----
  Returns plant of the week of USDA

* **URL**

  /plant/week

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**  
  
   None 

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
    [
      {
      _id: "5ced9a4b0657b6f769a69b98",
      imageUrl: "https://plants.sc.egov.usda.gov/gallery/thumbs/asco19_001_thp.jpg",
      commonName: "largeflower milkweed",
      sciName: "Asclepias connivens ",
      __v: 0
      }
    ]
                  
    ```
 
* **Error Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
                []
    ```

* **Sample Call:**

  ```curl
    curl https://growio-prod-test.herokuapp.com/plant/week
  ```


**Plant Photo Identification**
----
  Returns suggestions based on the photo clicked/uploaded by the user

* **URL**

  /plant/identify

* **Method:**

  `POST`
  
*  **URL Params**

   **Required:**  
  
   `token=[string]`

* **Data Params**
   
   `img=['base64 encoded string']`

* **Success Response:**

  * **Code:** 200 SUCCESS <br />
    **Content:** 
    ```javascript

                  
    ```
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** 
    ```javascript
                []
    ```

* **Sample Call:**

  ```curl
  ```
