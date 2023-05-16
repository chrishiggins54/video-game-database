// Execute when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://csg5ntlnsd.execute-api.eu-west-1.amazonaws.com/prod/gameresource";

    // Upload single game
    function uploadSingleGame() {
        // Get JSON data and create payload
        const jsonData = $("#single_game_json").val();
        const payload = { operation: "upload_single", item: JSON.parse(jsonData) };

        // Post request to upload the game
        $.post(apiUrl, JSON.stringify(payload), function() {
            alert("Single game uploaded");
        }).fail(function() {
            alert("Failed to upload single game");
        });
    }

    // Upload batch of games
    function uploadBatchGames() {
        // Get JSON data and create payload
        const jsonData = $("#batch_games_json").val();
        const items = JSON.parse(jsonData);
        const payload = { operation: "upload_batch", items };

        // Post request to upload the batch of games
        $.post(apiUrl, JSON.stringify(payload), function() {
            alert("Batch games uploaded");
        }).fail(function() {
            alert("Failed to upload batch games");
        });
    }

    // Fetch unique values for a given field
    function fetchUniqueValues(field) {
        // Make a POST request to fetch unique values
        return fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operation: "fetch_unique_values", field }),
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            if (data.statusCode === 200) {
                return JSON.parse(data.body);
            } else {
                throw new Error(`Error fetching unique values for ${field}: ${data.body || 'No error message provided'}`);
            }
        });
    }

    // Populate filter values for the dropdown
    function populateFilterValues() {
        const filterType = document.getElementById("queryFilter").value;
        const filterValuesDropdown = document.getElementById("query_value_dropdown");

        // Clear existing options
        filterValuesDropdown.innerHTML = "";

        // Fetch unique values and populate the dropdown
        fetchUniqueValues(filterType).then(function(uniqueValues) {
            uniqueValues.forEach(function(value) {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                filterValuesDropdown.appendChild(option);
            });
        }).catch(function(error) {
            console.error(error);
        });
    }

    // Handle the form submission and display results
    function onSubmitQueryForm(e) {
        e.preventDefault();

        // Create filter object based on user input
        const filter = {
            type: document.getElementById("queryFilter").value,
            value: document.getElementById("queryFilter").value === "Year" ? parseInt(document.getElementById("query_value_dropdown").value) : document.getElementById("query_value_dropdown").value,
        };

        const queryResultsElement = document.getElementById("queryResults");
        queryResultsElement.innerHTML = "Loading...";

        // Fetch data with the specified filter
        fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operation: "query", filter }),
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            if (data.statusCode === 200) {
                const games = JSON.parse(data.body);
                const table = document.createElement("table");
                const thead = document.createElement("thead");
                const tbody = document.createElement("tbody");
                const headerRow = document.createElement("tr");

                table.appendChild(thead);
                table.appendChild(tbody);
                thead.appendChild(headerRow);
    
                // Define table headers
                const headers = ["Game", "Year", "Genre", "Dev", "Publisher", "Platform"];
    
                // Create table header elements
                headers.forEach(function(header) {
                    const th = document.createElement("th");
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
    
                // Populate table with data
                games.forEach(function(game) {
                    const row = document.createElement("tr");
                    tbody.appendChild(row);
    
                    headers.forEach(function(prop) {
                        const td = document.createElement("td");
                        td.textContent = game[prop];
                        row.appendChild(td);
                    });
                });
    
                // Update query results element with the new table
                queryResultsElement.innerHTML = "";
                queryResultsElement.appendChild(table);
            } else {
                // Display error message if fetching data failed
                queryResultsElement.innerHTML = `Error: ${data.body}`;
            }
        });
    }
    
    // Event listeners for buttons and form
    $("#upload_single_btn").on("click", uploadSingleGame);
    $("#upload_batch_btn").on("click", uploadBatchGames);
    document.getElementById("queryFilter").addEventListener("change", populateFilterValues);
    
    // Populate filter values
    populateFilterValues();
    
    // Event listener for form submission
    document.getElementById("queryForm").addEventListener("submit", onSubmitQueryForm);
});