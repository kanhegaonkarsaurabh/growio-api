**Plantcyclopedia Search**
----
  Returns plants searched from the plantcylopedia back to the user

* **URL**

  /plantcyclopedia/search

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**  
  
   (`[]` does not represent arrays in this case)

   `plantSearch=[string]`
   `searchBy=['sciName' | 'commonName']`    
   `token=[string]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```javascript
                  {
                  msg: "SUCCESS: The following plant was found in the plantcyclopedia",
                  data: {
                  scientificName: "Adonis annua L.",
                  commonName: "blooddrops",
                  moisture_use: "Medium",
                  sunlight: "Partial",
                  temperature: "40",
                  symbol: "ADAN",
                  img: "https://plants.sc.egov.usda.gov/gallery/standard/adan_001_svd.jpg"
                  },
                  success: true
                 }
    ```
 
* **Error Response:**

  * **Code:** 404 NOT FOUND <br />
    **Content:** 
    ```javascript
                  {
                  msg: "NOT FOUND: Could not find any plants that match the search query in Plantcyclopedia",
                  success: false,
                  data: { }
                  }
    ```

  OR

  * **Code:** 404 NOT FOUND <br />
    **Content:** 
    ```javascript
    {
      msg: "ERROR: Currently Plantcyclopedia can only be searchedBy sciName or commonName. Please pass correct query params",
      success: false
    }
    ```

* **Sample Call:**

  ```curl
    curl https://growio-prod-test.herokuapp.com/plantcyclopedia/search?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTI0Mzc1ODU2MTgyMzQ2ODU5NzIiLCJpYXQiOjE1NTkwNzQ4NDIsImV4cCI6MTU1OTA4OTU0Mn0.01bAEnkoCFoikQK7VyEPGKLjvqoimfTpUeX5GG4XYeE&searchPlant=blooddrops&searchBy=commonName
  ```