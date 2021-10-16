window.addEventListener('DOMContentLoaded', function () {
    let apiData = [];
    let tableData = [];
    let filtersApplied = [];
    let searchValue = '';
    let page = 0;
    let tableDataEle = document.getElementById("table-data");
    const MAX_ROWS = 4;

    document.querySelector('#filters').addEventListener('change', function (e) {
        if (e.target.type === 'checkbox') {
            // Reset to page 1
            page = 0;

            if (e.target.checked) {
                filtersApplied.push(e.target.value);
            } else {
                const index = filtersApplied.findIndex((item) => item === e.target.value);
                filtersApplied.splice(index, 1);
            }

            if (!!e.target.value && filtersApplied.length) {
                tableData = apiData.filter((item) => filtersApplied.includes(item.type));
                getDataAsPerPageNumber();
            } else {
                tableData = [...apiData];
                getDataAsPerPageNumber();
            }
        }
    });


    document.querySelector('#filters').addEventListener('keyup', function (e) {
        searchValue = e.target.value;
        // Reset to page 1
        page = 0;

        if (!!e.target.value && e.target.name === 'search-input') {
            tableData = apiData.filter((item) => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
            getDataAsPerPageNumber();
        } else {
            searchValue = '';
            tableData = [...apiData];
            getDataAsPerPageNumber();
        }
    });


    document.querySelector('#btn-next').addEventListener('click', function () {
        page += 1;
        getDataAsPerPageNumber();
    });

    document.querySelector('#btn-prev').addEventListener('click', function () {
        if(page == 0) {
            page = 0;
        getDataAsPerPageNumber();
        } else {
            page -= 1;
            getDataAsPerPageNumber();
        }
    });

    function inchesToFt(value) {
        return value ? (parseInt(value, 10) / 12).toFixed(1) : 0;
    }

    function toDegreesMinutesAndSeconds(coordinate) {
        let absolute = Math.abs(coordinate);
        let degrees = Math.floor(absolute);
        let minutesNotTruncated = (absolute - degrees) * 60;
        let minutes = Math.floor(minutesNotTruncated);
        let seconds = Math.floor((minutesNotTruncated - minutes) * 60);

        return degrees + "&deg" + minutes + "'";
    }

    function convertDMSLat(lat) {
        let latitude = toDegreesMinutesAndSeconds(lat);
        let latitudeCardinal = lat >= 0 ? "N" : "S";

        return latitudeCardinal + latitude;
    }

    function convertDMSLong(lng) {
        let longitude = toDegreesMinutesAndSeconds(lng);
        let longitudeCardinal = lng >= 0 ? "E" : "W";

        return longitudeCardinal + longitude;
    }

    function populateTableData(data) {
        let htmlRows = '';

        if (data.length) {
            tableDataEle.innerHTML = '';

            data.forEach((item) => {
                htmlRows += ` <tr>
                          <td>${item.name}</td>
                          <td>${item.icao}</td>
                          <td>${item.iata || '-'}</td>
                          <td>${inchesToFt(item.elevation)} ft</td>
                          <td>${convertDMSLat(item.latitude)}</td>
                          <td>${convertDMSLong(item.longitude)}</td>
                          <td class="text-capitalize">${item.type}</td>
                      </tr>
                    `;
            });

            tableDataEle.innerHTML += htmlRows;
        } else {
            tableDataEle.innerHTML = '';
            document.querySelector('.pagination-info').innerHTML = "No Results Found";
        }
    }

    function getDataAsPerPageNumber() {
        const startIndex = page * MAX_ROWS;
        const endIndex = (page + 1) * MAX_ROWS;
        const currentPageData = tableData.slice(startIndex, endIndex);

        document.querySelector('.pagination-info').innerHTML = `Showing <b>${startIndex + 1}-${endIndex}</b> of <b>${tableData.length.toLocaleString()}</b> results`;

        populateTableData(currentPageData);
    }

    function getAllData() {
        fetch("./data/airports.json")
            .then((response) => response.json())
            .then((data) => {
                apiData = data;
                tableData = data;
                // Populate initial data
                getDataAsPerPageNumber();
            });
    }

    getAllData();
});