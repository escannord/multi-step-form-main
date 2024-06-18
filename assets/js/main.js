/* definition of prototypes */
HTMLElement.prototype.parents = function (selector) {
    var parent = this.parentElement;

    if (!parent.matches(selector) && parent.nodeName != "HTML") {
        parent = parent.parents(selector);
    }

    return parent;
};
NodeList.prototype.html = function (innerHTML) {
    this.forEach((element) => {
        element.innerHTML = innerHTML;
    });
};

NodeList.prototype.addClass = function (classes) {
    this.forEach((element) => {
        element.classList.add(classes);
    });
};

NodeList.prototype.removeClass = function (classes) {
    this.forEach((element) => {
        element.classList.remove(classes);
    });
};
/* end */

var prices = {
    plans: {
        arcade: 9,
        advanced: 12,
        pro: 15,
    },
    addons: {
        online: 1,
        storage: 2,
        customize: 2,
    },
};
function getErrorMessage(input, errorElement) {
    var validity = input.validity;
    if (validity.valueMissing) {
        errorElement.textContent = "This field is required.";
    } else if (validity.typeMismatch) {
        errorElement.textContent =
            "Please enter a valid " + input.getAttribute("type") + ".";
    } else if (validity.patternMismatch) {
        errorElement.textContent = "Please match the requested format.";
    } else if (validity.tooLong) {
        errorElement.textContent = "The value is too long.";
    } else if (validity.tooShort) {
        errorElement.textContent = "The value is too short.";
    } else if (validity.rangeUnderflow) {
        errorElement.textContent = "The value is too low.";
    } else if (validity.rangeOverflow) {
        errorElement.textContent = "The value is too high.";
    } else if (validity.stepMismatch) {
        errorElement.textContent = "The value is not a valid increment.";
    } else if (validity.badInput) {
        errorElement.textContent = "Please enter a valid input.";
    } else if (validity.customError) {
        errorElement.textContent = input.validationMessage;
    }
   
    errorElement.classList.add("show-error");
}
function nextStep(event, element) {
    event.preventDefault();
    var currentStep = element.parents(".steps");
    /* verication */
    var hasError = false;
    currentStep.querySelectorAll("input").forEach((input) => {
        if (!input.checkValidity()) {
            input.classList.add("invalid");
            hasError = true;
            var errorElement;
            if (currentStep.classList.contains("step-1")) {
                errorElement =
                    input.previousElementSibling.querySelector(".error-message");
            } else {
                errorElement = input
                    .parents(".step-content")
                    .querySelector(".error-message");
            }

            getErrorMessage(input, errorElement);
        }
    });

    currentStep.querySelectorAll("input.invalid").forEach((input) => {
        input.addEventListener("input", function () {
            var errorElement;
            if (currentStep.classList.contains("step-1")) {
                errorElement =
                    input.previousElementSibling.querySelector(".error-message");
            } else {
                errorElement = input
                    .parents(".step-content")
                    .querySelector(".error-message");
            }
            if (this.checkValidity()) {
                errorElement.classList.remove("show-error");
            } else {
                getErrorMessage(input, errorElement);
            }
        });
    });
    /* end of verification */
    if (!hasError) {
        currentStep.classList.contains("step-3") ? renderSummary() : null;

        currentStep.classList.remove("active");
        currentStep.nextElementSibling.classList.add("active");
        nextNavStep();
    }
}

function backStep(event, element) {
    event.preventDefault();
    var currentStep = element.parents(".steps");
    currentStep.classList.remove("active");
    currentStep.previousElementSibling.classList.add("active");
    prevNavStep();
}

function confirm_submit(event, element) {
    event.preventDefault();
    var currentStep = element.parents(".steps");
    currentStep.classList.remove("active");
    currentStep.nextElementSibling.classList.add("active");
}

function priceOfYear(listOfPrice = new NodeList()) {
    listOfPrice.forEach((element) => {
        element.textContent = parseInt(element.textContent) * 10;
    });
}

function priceOfMonth(listOfPrice = new NodeList()) {
    listOfPrice.forEach((element) => {
        element.textContent = parseInt(element.textContent) / 10;
    });
}

function toggle_frequency() {
    var price = document.querySelectorAll(".price-number");
    var priceUnit = document.querySelectorAll(".price-unit");
    var per = document.querySelector(".per");
    var frequency = document.querySelector(".summary-frequency");
    var freeMonths = document.querySelectorAll(".free-months");

    if (this.checked) {
        priceOfYear(price);
        priceUnit.html("/yr");
        per.textContent = "year";
        frequency.textContent = "Yearly";
        updatePrices(prices, 10);
        freeMonths.removeClass("hidden");
    } else {
        priceOfMonth(price);
        priceUnit.html("/mo");
        per.textContent = "month";
        frequency.textContent = "Monthly";
        updatePrices(prices, 10, false);
        freeMonths.addClass("hidden");
    }
}

function updatePrices(prices, number, yearly = true) {
    for (let key in prices) {
        if (prices.hasOwnProperty(key)) {
            if (typeof prices[key] === "object" && prices[key] !== null) {
                updatePrices(prices[key], number, yearly);
            } else if (typeof prices[key] === "number") {
                yearly ? (prices[key] *= number) : (prices[key] /= number);
            }
        }
    }
}

function renderSummary() {
    /* operating zone */
    var plan = document.querySelector("[name='input-plan']:checked");
    var inputFreq = document.getElementById("input-frequency");
    var inputAddons = document.querySelectorAll(".input-addons:checked");
    var totalPrice = document.querySelector(".total-price");
    var planChoice = document.querySelector(".plan-choice");
    var pricePlanChoice = document.querySelector(".price-plan-choice");
    var listSummaryAddons = document.querySelector(".list-summary-addons");
    var Total = 0;
    var addonsList = "";
    Total = prices.plans[plan.value];
    if (inputAddons.length > 0) {
        inputAddons.forEach((addons) => {
            /* list summary addons */
            var text =
                addons.nextElementSibling.querySelector(
                    ".addons-title"
                ).textContent;
            addonsList += `<li class="summary-addons-item">
													<p class="text">${text}</p>
													<div class="summary-price">
														<span class="prefix">+$</span
														><span class="price-number">${prices.addons[addons.value]}</span
														><span class="price-unit">/mo</span>
													</div>
												</li>`;
            Total += prices.addons[addons.value];
        });
    }
    listSummaryAddons.innerHTML = addonsList;
    pricePlanChoice.textContent = prices.plans[plan.value];
    planChoice.textContent = plan.value;
    totalPrice.textContent = Total;
    /* end zone */
}

function nextNavStep() {
    var currentNav = document.querySelector(".nav-item.active");
    currentNav.classList.remove("active");
    currentNav.nextElementSibling.classList.add("active");
}

function prevNavStep() {
    var currentNav = document.querySelector(".nav-item.active");
    currentNav.classList.remove("active");
    currentNav.previousElementSibling.classList.add("active");
}

function goToStep(step) {
    document.querySelectorAll(".steps").removeClass("active");
    document.querySelector(`.step-${step}`).classList.add("active");
    document.querySelector(".nav-item.active").classList.remove("active");
    document
        .querySelector(`.nav-item:nth-child(${step})`)
        .classList.add("active");
}

document.addEventListener("DOMContentLoaded", function (event) {
    document
        .getElementById("input-frequency")
        .addEventListener("change", toggle_frequency);
});