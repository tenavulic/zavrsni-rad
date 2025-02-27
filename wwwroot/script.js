document.addEventListener("DOMContentLoaded", function () {
    // Detect which page is loaded by checking for unique element IDs
    if (document.getElementById("yearFilter")) {
        setupOverview();
    }
    if (document.getElementById("countryForm")) {
        setupCountryPage();
    }
    if (document.getElementById("companyForm")) {
        setupCompanyPage();
    }
    if (document.getElementById("urlForm")) {
        setupUrlPage();
    }
    if (document.getElementById("incomeForm")) {
        setupIncomePage();
    }
    if (document.getElementById("companyDetailForm")) {
        setupCompanyDetailPage();
    }
});

/* ======================================================
   Overview Page (index.html) - Companies & Aggregated Income
   ====================================================== */
function setupOverview() {
    const yearFilter = document.getElementById("yearFilter");
    const countryFilter = document.getElementById("countryFilter");
    const searchNameInput = document.getElementById("searchName");
    const orderSelect = document.getElementById("orderSelect");
    const companiesTableBody = document.querySelector("#companiesTable tbody");

    let companies = [];
    let incomes = [];
    let countries = [];

    async function fetchOverviewData() {
        try {
            const companiesResponse = await fetch("/api/company");
            companies = await companiesResponse.json();

            const incomesResponse = await fetch("/api/income");
            incomes = await incomesResponse.json();

            const countriesResponse = await fetch("/api/country");
            countries = await countriesResponse.json();

            populateYearOptions();
            populateCountryOptions();
            updateOverviewTable();
        } catch (error) {
            console.error("Error fetching overview data:", error);
        }
    }

    function populateYearOptions() {
        const years = new Set(incomes.map(i => i.year));
        // Remove all options except the default "All Years"
        while (yearFilter.options.length > 1) {
            yearFilter.remove(1);
        }
        Array.from(years)
            .sort()
            .forEach(year => {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            });
    }

    function populateCountryOptions() {
        // Remove all options except default "All Countries"
        while (countryFilter.options.length > 1) {
            countryFilter.remove(1);
        }
        // Sort countries by name and add them as options
        countries.sort((a, b) => a.name.localeCompare(b.name)).forEach(country => {
            const option = document.createElement("option");
            option.value = country.countryId;
            option.textContent = country.name;
            countryFilter.appendChild(option);
        });
    }

    function updateOverviewTable() {
        companiesTableBody.innerHTML = "";
        const selectedYear = yearFilter.value;
        const selectedCountry = countryFilter.value;
        const searchName = searchNameInput.value.trim().toLowerCase();
        const orderBy = orderSelect.value;

        let filteredCompanies = companies.slice();
        if (selectedCountry !== "all") {
            filteredCompanies = filteredCompanies.filter(company => company.countryId === parseInt(selectedCountry));
        }
        if (searchName !== "") {
            filteredCompanies = filteredCompanies.filter(company => company.name.toLowerCase().includes(searchName));
        }

        const companiesWithIncome = filteredCompanies.map(company => {
            let filteredIncomes = incomes.filter(i => i.companyId === company.companyId);
            if (selectedYear !== "all") {
                filteredIncomes = filteredIncomes.filter(i => i.year.toString() === selectedYear);
            }
            const totalIncome = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
            return { ...company, totalIncome };
        });

        if (orderBy === "alphabetical") {
            companiesWithIncome.sort((a, b) => a.name.localeCompare(b.name));
        } else if (orderBy === "income") {
            companiesWithIncome.sort((a, b) => b.totalIncome - a.totalIncome);
        }

        companiesWithIncome.forEach(company => {
            const row = document.createElement("tr");

            // Company Name
            const nameCell = document.createElement("td");
            nameCell.textContent = company.name;
            row.appendChild(nameCell);

            // Country Name
            const countryCell = document.createElement("td");
            const country = countries.find(c => c.countryId === company.countryId);
            countryCell.textContent = country ? country.name : "";
            row.appendChild(countryCell);

            // Aggregated Income
            const incomeCell = document.createElement("td");
            incomeCell.textContent = company.totalIncome.toFixed(2);
            row.appendChild(incomeCell);

            // Actions cell with a "Show" button
            const actionsCell = document.createElement("td");
            const showButton = document.createElement("button");
            showButton.textContent = "Show";
            showButton.addEventListener("click", function () {
                window.location.href = "company.html?id=" + company.companyId;
            });
            actionsCell.appendChild(showButton);
            row.appendChild(actionsCell);

            companiesTableBody.appendChild(row);
        });
    }

    yearFilter.addEventListener("change", updateOverviewTable);
    countryFilter.addEventListener("change", updateOverviewTable);
    searchNameInput.addEventListener("input", updateOverviewTable);
    orderSelect.addEventListener("change", updateOverviewTable);

    fetchOverviewData();
}

/* ============================
   Countries Page (countries.html)
   ============================ */
function setupCountryPage() {
    const countriesTableBody = document.querySelector("#countriesTable tbody");
    const countryForm = document.getElementById("countryForm");
    const countryIdInput = document.getElementById("countryId");
    const countryNameInput = document.getElementById("countryName");

    loadCountries();

    countryForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = countryIdInput.value;
        const name = countryNameInput.value;
        const data = { name: name };

        if (id) {
            fetch(`/api/country/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ countryId: parseInt(id), name: name })
            }).then(response => {
                if (response.ok) {
                    resetCountryForm();
                    loadCountries();
                } else {
                    console.error("Error updating country");
                }
            });
        } else {
            fetch("/api/country", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    resetCountryForm();
                    loadCountries();
                } else {
                    console.error("Error creating country");
                }
            });
        }
    });

    function loadCountries() {
        fetch("/api/country")
            .then(response => response.json())
            .then(data => populateCountriesTable(data))
            .catch(error => console.error("Error loading countries:", error));
    }

    function populateCountriesTable(countries) {
        countriesTableBody.innerHTML = "";
        countries.forEach(country => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${country.countryId}</td>
                <td>${country.name}</td>
                <td>
                  <button onclick="editCountry(${country.countryId}, '${country.name}')">Edit</button>
                  <button onclick="deleteCountry(${country.countryId})">Delete</button>
                </td>
            `;
            countriesTableBody.appendChild(row);
        });
    }

    window.editCountry = function (id, name) {
        countryIdInput.value = id;
        countryNameInput.value = name;
    };

    window.deleteCountry = function (id) {
        if (confirm("Are you sure you want to delete this country?")) {
            fetch(`/api/country/${id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        loadCountries();
                    } else {
                        console.error("Error deleting country");
                    }
                });
        }
    };

    function resetCountryForm() {
        countryIdInput.value = "";
        countryNameInput.value = "";
    }
}

/* =============================
   Companies Page (companies.html)
   ============================= */
function setupCompanyPage() {
    const companiesTableBody = document.querySelector("#companiesTable tbody");
    const companyForm = document.getElementById("companyForm");
    const companyIdInput = document.getElementById("companyId");
    const companyNameInput = document.getElementById("companyName");
    const companyCountrySelect = document.getElementById("companyCountryId");
    const companyEstablishedInput = document.getElementById("companyEstablished");
    const companyAddressInput = document.getElementById("companyAddress");
    const companyEmailInput = document.getElementById("companyEmail");

    populateCountryDropdownForCompany();
    loadCompanies();

    companyForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = companyIdInput.value;
        const data = {
            name: companyNameInput.value,
            countryId: companyCountrySelect.value ? parseInt(companyCountrySelect.value) : null,
            established: companyEstablishedInput.value ? parseInt(companyEstablishedInput.value) : null,
            address: companyAddressInput.value,
            email: companyEmailInput.value
        };

        if (id) {
            data.companyId = parseInt(id);
            fetch(`/api/company/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    resetCompanyForm();
                    loadCompanies();
                } else {
                    console.error("Error updating company");
                }
            });
        } else {
            fetch("/api/company", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    resetCompanyForm();
                    loadCompanies();
                } else {
                    console.error("Error creating company");
                }
            });
        }
    });

    function loadCompanies() {
        fetch("/api/company")
            .then(response => response.json())
            .then(data => populateCompaniesTable(data))
            .catch(error => console.error("Error loading companies:", error));
    }

    function populateCompaniesTable(companies) {
        companiesTableBody.innerHTML = "";
        companies.forEach(company => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${company.companyId}</td>
                <td>${company.name}</td>
                <td>${company.countryId || ""}</td>
                <td>${company.established || ""}</td>
                <td>${company.address || ""}</td>
                <td>${company.email || ""}</td>
                <td>
                  <button onclick="editCompany(${company.companyId}, '${company.name}', ${company.countryId || 0}, ${company.established || 0}, '${company.address || ""}', '${company.email || ""}')">Edit</button>
                  <button onclick="deleteCompany(${company.companyId})">Delete</button>
                </td>
            `;
            companiesTableBody.appendChild(row);
        });
    }

    function populateCountryDropdownForCompany() {
        fetch("/api/country")
            .then(response => response.json())
            .then(countries => {
                companyCountrySelect.innerHTML = '<option value="">Select Country</option>';
                countries.forEach(country => {
                    const option = document.createElement("option");
                    option.value = country.countryId;
                    option.textContent = country.name;
                    companyCountrySelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading countries:", error));
    }

    window.editCompany = function (id, name, countryId, established, address, email) {
        companyIdInput.value = id;
        companyNameInput.value = name;
        companyCountrySelect.value = countryId;
        companyEstablishedInput.value = established;
        companyAddressInput.value = address;
        companyEmailInput.value = email;
    };

    window.deleteCompany = function (id) {
        if (confirm("Are you sure you want to delete this company?")) {
            fetch(`/api/company/${id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        loadCompanies();
                    } else {
                        console.error("Error deleting company");
                    }
                });
        }
    };

    function resetCompanyForm() {
        companyIdInput.value = "";
        companyNameInput.value = "";
        companyCountrySelect.value = "";
        companyEstablishedInput.value = "";
        companyAddressInput.value = "";
        companyEmailInput.value = "";
    }
}

/* ============================
   URLs Page (urls.html)
   ============================
   (This page is for general URL management.)
*/
function setupUrlPage() {
    const urlsTableBody = document.querySelector("#urlsTable tbody");
    const urlForm = document.getElementById("urlForm");
    const urlValueInput = document.getElementById("urlValue");
    const urlCompanySelect = document.getElementById("urlCompanyId");
    const urlCountrySelect = document.getElementById("urlCountryId");

    populateCompanyDropdownForUrl();
    populateCountryDropdownForUrl();
    loadUrls();

    urlForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = {
            link: urlValueInput.value,
            companyId: parseInt(urlCompanySelect.value),
            countryId: parseInt(urlCountrySelect.value)
        };

        fetch("/api/url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                resetUrlForm();
                loadUrls();
            } else {
                console.error("Error creating URL");
            }
        });
    });

    function populateCompanyDropdownForUrl() {
        fetch("/api/company")
            .then(response => response.json())
            .then(companies => {
                urlCompanySelect.innerHTML = '<option value="">Select Company</option>';
                companies.forEach(company => {
                    const option = document.createElement("option");
                    option.value = company.companyId;
                    option.textContent = company.name;
                    urlCompanySelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading companies:", error));
    }

    function populateCountryDropdownForUrl() {
        fetch("/api/country")
            .then(response => response.json())
            .then(countries => {
                urlCountrySelect.innerHTML = '<option value="">Select Country</option>';
                countries.forEach(country => {
                    const option = document.createElement("option");
                    option.value = country.countryId;
                    option.textContent = country.name;
                    urlCountrySelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading countries:", error));
    }

    function loadUrls() {
        fetch("/api/url")
            .then(response => response.json())
            .then(data => populateUrlsTable(data))
            .catch(error => console.error("Error loading URLs:", error));
    }

    function populateUrlsTable(urls) {
        urlsTableBody.innerHTML = "";
        urls.forEach(urlObj => {
            const companyName = urlObj.company && urlObj.company.name ? urlObj.company.name : urlObj.companyId;
            const countryName = urlObj.country && urlObj.country.name ? urlObj.country.name : urlObj.countryId;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${urlObj.link}</td>
                <td>${companyName}</td>
                <td>${countryName}</td>
                <td>
                  <button onclick="editUrl('${urlObj.link}', ${urlObj.companyId}, ${urlObj.countryId})">Edit</button>
                  <button onclick="deleteUrl('${urlObj.link}')">Delete</button>
                </td>
            `;
            urlsTableBody.appendChild(row);
        });
    }

    window.editUrl = function (link, companyId, countryId) {
        urlValueInput.value = link;
        urlCompanySelect.value = companyId;
        urlCountrySelect.value = countryId;
    };

    window.deleteUrl = function (link) {
        if (confirm("Are you sure you want to delete this URL?")) {
            fetch(`/api/url/${encodeURIComponent(link)}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        loadUrls();
                    } else {
                        console.error("Error deleting URL");
                    }
                });
        }
    };

    function resetUrlForm() {
        urlValueInput.value = "";
        urlCompanySelect.value = "";
        urlCountrySelect.value = "";
    }
}

/* ============================
   Incomes Page (incomes.html)
   ============================
*/
function setupIncomePage() {
    const incomesTableBody = document.querySelector("#incomesTable tbody");
    const incomeForm = document.getElementById("incomeForm");
    const incomeIdInput = document.getElementById("incomeId");
    const incomeCompanyIdInput = document.getElementById("incomeCompanyId");
    const incomeYearInput = document.getElementById("incomeYear");
    const incomeAmountInput = document.getElementById("incomeAmount");

    loadIncomes();

    incomeForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = incomeIdInput.value;
        const data = {
            companyId: parseInt(incomeCompanyIdInput.value),
            year: parseInt(incomeYearInput.value),
            amount: parseFloat(incomeAmountInput.value)
        };

        if (id) {
            data.incomeId = parseInt(id);
            fetch(`/api/income/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    resetIncomeForm();
                    loadIncomes();
                } else {
                    console.error("Error updating income");
                }
            });
        } else {
            fetch("/api/income", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    resetIncomeForm();
                    loadIncomes();
                } else {
                    console.error("Error creating income");
                }
            });
        }
    });

    function loadIncomes() {
        fetch("/api/income")
            .then(response => response.json())
            .then(data => populateIncomesTable(data))
            .catch(error => console.error("Error loading incomes:", error));
    }

    function populateIncomesTable(incomes) {
        incomesTableBody.innerHTML = "";
        incomes.forEach(income => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${income.incomeId}</td>
                <td>${income.companyId}</td>
                <td>${income.year}</td>
                <td>${income.amount}</td>
                <td>
                  <button onclick="editIncome(${income.incomeId}, ${income.companyId}, ${income.year}, ${income.amount})">Edit</button>
                  <button onclick="deleteIncome(${income.incomeId})">Delete</button>
                </td>
            `;
            incomesTableBody.appendChild(row);
        });
    }

    window.editIncome = function (id, companyId, year, amount) {
        incomeIdInput.value = id;
        incomeCompanyIdInput.value = companyId;
        incomeYearInput.value = year;
        incomeAmountInput.value = amount;
    };

    window.deleteIncome = function (id) {
        if (confirm("Are you sure you want to delete this income?")) {
            fetch(`/api/income/${id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        loadIncomes();
                    } else {
                        console.error("Error deleting income");
                    }
                });
        }
    };

    function resetIncomeForm() {
        incomeIdInput.value = "";
        incomeCompanyIdInput.value = "";
        incomeYearInput.value = "";
        incomeAmountInput.value = "";
    }
}

/* ======================================================
   Company Detail Page (company.html)
   ====================================================== */
function setupCompanyDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get("id");
    if (!companyId) {
        console.error("No company ID provided in query string.");
        return;
    }

    // Form elements for editing company details
    const detailForm = document.getElementById("companyDetailForm");
    const detailCompanyIdInput = document.getElementById("detailCompanyId");
    const detailCompanyNameInput = document.getElementById("detailCompanyName");
    const detailCompanyCountrySelect = document.getElementById("detailCompanyCountry");
    const detailCompanyOwnedByInput = document.getElementById("detailCompanyOwnedBy");
    const detailCompanyEstablishedInput = document.getElementById("detailCompanyEstablished");
    const detailCompanyAddressInput = document.getElementById("detailCompanyAddress");
    const detailCompanyEmailInput = document.getElementById("detailCompanyEmail");

    // Elements for managing the company's URLs
    const companyUrlForm = document.getElementById("companyUrlForm");
    const companyUrlIdInput = document.getElementById("companyUrlId"); // For editing a URL if needed
    const companyUrlLinkInput = document.getElementById("companyUrlLink");
    const companyUrlsTableBody = document.querySelector("#companyUrlsTable tbody");

    async function loadCompanyDetails() {
        try {
            const response = await fetch(`/api/company/${companyId}`);
            const company = await response.json();
            detailCompanyIdInput.value = company.companyId;
            detailCompanyNameInput.value = company.name;
            detailCompanyOwnedByInput.value = company.ownedBy || "";
            detailCompanyEstablishedInput.value = company.established || "";
            detailCompanyAddressInput.value = company.address || "";
            detailCompanyEmailInput.value = company.email || "";
            if (company.countryId) {
                detailCompanyCountrySelect.value = company.countryId;
            }
        } catch (error) {
            console.error("Error loading company details:", error);
        }
    }

    function populateDetailCountryDropdown() {
        fetch("/api/country")
            .then(response => response.json())
            .then(countries => {
                detailCompanyCountrySelect.innerHTML = '<option value="">Select Country</option>';
                countries.forEach(country => {
                    const option = document.createElement("option");
                    option.value = country.countryId;
                    option.textContent = country.name;
                    detailCompanyCountrySelect.appendChild(option);
                });
                loadCompanyDetails();
            })
            .catch(error => console.error("Error loading countries:", error));
    }

    detailForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = {
            companyId: parseInt(detailCompanyIdInput.value),
            name: detailCompanyNameInput.value,
            countryId: detailCompanyCountrySelect.value ? parseInt(detailCompanyCountrySelect.value) : null,
            ownedBy: detailCompanyOwnedByInput.value,
            established: detailCompanyEstablishedInput.value ? parseInt(detailCompanyEstablishedInput.value) : null,
            address: detailCompanyAddressInput.value,
            email: detailCompanyEmailInput.value
        };

        fetch(`/api/company/${data.companyId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                alert("Company details updated successfully.");
            } else {
                console.error("Error updating company details.");
            }
        });
    });

    function loadCompanyUrls() {
        // Assuming you have an endpoint to fetch URLs by company:
        fetch(`/api/url/bycompany/${companyId}`)
            .then(response => response.json())
            .then(data => populateCompanyUrlsTable(data))
            .catch(error => console.error("Error loading company URLs:", error));
    }

    function populateCompanyUrlsTable(urls) {
        companyUrlsTableBody.innerHTML = "";
        urls.forEach(urlObj => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${urlObj.link}</td>
                <td>
                  <button onclick="editCompanyUrl('${urlObj.link}')">Edit</button>
                  <button onclick="deleteCompanyUrl('${urlObj.link}')">Delete</button>
                </td>
            `;
            companyUrlsTableBody.appendChild(row);
        });
    }

    companyUrlForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = {
            link: companyUrlLinkInput.value,
            companyId: parseInt(companyId),
            // Optionally, use the same country as the company
            countryId: detailCompanyCountrySelect.value ? parseInt(detailCompanyCountrySelect.value) : null
        };

        fetch("/api/url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                resetCompanyUrlForm();
                loadCompanyUrls();
            } else {
                console.error("Error creating company URL");
            }
        });
    });

    window.editCompanyUrl = function (link) {
        companyUrlLinkInput.value = link;
        // For simplicity, this example only supports editing the link.
    };

    window.deleteCompanyUrl = function (link) {
        if (confirm("Are you sure you want to delete this URL?")) {
            fetch(`/api/url/${encodeURIComponent(link)}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        loadCompanyUrls();
                    } else {
                        console.error("Error deleting company URL");
                    }
                });
        }
    };

    function resetCompanyUrlForm() {
        companyUrlIdInput.value = "";
        companyUrlLinkInput.value = "";
    }

    populateDetailCountryDropdown();
    loadCompanyUrls();
}
