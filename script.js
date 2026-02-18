// --- CLEAR LOCAL STORAGE FOR FRESH START ---
// localStorage.removeItem('bookedLeaves');
// localStorage.removeItem('leaveBalances');

//i have to comment this out once i clear the form

// REFERENCES

// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
// https://stackoverflow.com/questions/74637298/do-i-need-to-use-json-stringify-to-save-an-object-in-localstorage-in-js
// https://youtu.be/PCwhTWT3yhI?si=al1rQK8j6wZGWIJ_

const upcomingHolidays = [
  { date: "04-Mar-2026, Wednesday", name: "Holi", type: "Holiday" },
  { date: "03-Apr-2026, Friday", name: "Good Friday", type: "Holiday" },
  { date: "27-May-2026, Wednesday", name: "Eid-Ul-Zuha", type: "Holiday" },
  { date: "24-Jun-2026, Wednesday", name: "Summer Break - 2026", type: "Holiday" },
  { date: "25-Jun-2026, Thursday", name: "Summer Break - 2026", type: "Holiday" },
  { date: "26-Jun-2026, Friday", name: "Summer Break - 2026", type: "Holiday" },
  { date: "28-Aug-2026, Friday", name: "Raksha Bandhan", type: "Holiday" },
  { date: "02-Oct-2026, Friday", name: "Gandhi Jayanti", type: "National Holiday" },
  { date: "20-Oct-2026, Tuesday", name: "Dussehra", type: "Holiday" },
  { date: "09-Nov-2026, Monday", name: "Diwali", type: "Holiday" },
  { date: "24-Nov-2026, Tuesday", name: "Gurunanak Jayanti", type: "Holiday" },
  { date: "25-Dec-2026, Friday", name: "Christmas", type: "Holiday" },
  { date: "30-Dec-2026, Wednesday", name: "Winter Break - 2026-2027", type: "Holiday" },
  { date: "31-Dec-2026, Thursday", name: "Winter Break - 2026-2027", type: "Holiday" }
];

// --- Load Data from LocalStorage ---
const savedLeaves = JSON.parse(localStorage.getItem('bookedLeaves')) || [];
const allEvents = [...upcomingHolidays, ...savedLeaves];

const defaultBalances = { 'MyDay': 1, 'Compensatory Leave (CL)': 2, 'Personal Time Off (PTO)': 24 };
const savedBalances = JSON.parse(localStorage.getItem('leaveBalances')) || defaultBalances;

// --- Select Elements ---
const upcomingContent = document.querySelector(".upcoming__content");
const upcomingSelect = document.querySelector(".upcoming__select");
const pastContent = document.querySelector(".past__content");
const pastSelect = document.querySelector(".past__select");
const applyBtn = document.querySelector('.leave__wrapper--top-right-btn');
const modal = document.querySelector('.leave__modal');
const form = document.querySelector('.leave__modal--form');
const cancelBtn = document.querySelector('.leave__modal--button-secondary');
const startInput = document.getElementById('start-date');
const endInput = document.getElementById('end-date');
const leaveTypeEl = document.getElementById('leave-type');
const reasonEl = document.getElementById('reason');
const halfDayCheckbox = document.getElementById('half-day');

// Balance Elements
const balances = {
  'MyDay': document.getElementById('myday-balance'),
  'Compensatory Leave (CL)': document.getElementById('comp-balance'),
  'Personal Time Off (PTO)': document.getElementById('pto-balance')
};

// Booked Elements
const myDayBookedEl = document.getElementById('myday-booked');
const compBookedEl = document.getElementById('comp-booked');
const ptoBookedEl = document.getElementById('pto-booked');

const totalBookedEl = document.getElementById('total-booked');

const googleForm = {
  action: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdNRlQaQEl66X5saBsqTnLpKRrmhLWrwnMGHLg2bWXr1d-GjA/formResponse",
  fields: {
    leaveType: "entry.718293726",
    startDay: "entry.107583098_day",
    startMonth: "entry.107583098_month",
    startYear: "entry.107583098_year",
    endDay: "entry.2086399054_day",
    endMonth: "entry.2086399054_month",
    endYear: "entry.2086399054_year",
    reason: "entry.282382539"
  }
};


function parseEventDate(dateStr) {
  const cleanDate = dateStr.split(',')[0];

  const [day, monthStr, year] = cleanDate.split('-');

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = months.indexOf(monthStr);

  return new Date(year, monthIndex, day);
}

function displayEvents(container, filter, isUpcoming) {
  if (!container) return;
  container.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight

  let listToDisplay = [];

  allEvents.forEach(event => {
    const eventDate = parseEventDate(event.date);

    if (isUpcoming && eventDate >= today) {
      listToDisplay.push(event);
    } else if (!isUpcoming && eventDate < today) {
      listToDisplay.push(event);
    }
  });

  if (filter === "holidays") listToDisplay = listToDisplay.filter(e => e.type.toLowerCase().includes("holiday"));
  if (filter === "leaves") listToDisplay = listToDisplay.filter(e => e.type.toLowerCase() === "leave");

  listToDisplay.sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

  const listDiv = document.createElement("div");
  let prefix = "";
  if (isUpcoming) {
    listDiv.className = "upcoming__list";
    prefix = "upcoming";
  } else {
    listDiv.className = "past__list";
    prefix = "past";
  }

  listToDisplay.forEach(event => {
    const item = document.createElement("div");
    item.className = prefix + "__item";

    item.innerHTML = `
      <div class="${prefix}__item-date">${event.date}</div>
      <div class="${prefix}__item-info">
        <img class="${prefix}__item-icon" src="./media/nav/calendar-svgrepo-com.svg" alt="calendar">
        <span class="${prefix}__item-name">${event.name}</span>
      </div>`;
    listDiv.appendChild(item);
  });
  container.appendChild(listDiv);
}

function updateBalanceUI() {
  for (const key in balances) {
    if (balances[key]) balances[key].textContent = savedBalances[key];
  }
  let myDayCount = 0;
  let compCount = 0;
  let ptoCount = 0;
  let totalBooked = 0;

  savedLeaves.forEach(leave => {

    const days = typeof leave.duration !== 'undefined' ? parseFloat(leave.duration) : 1;

    if (leave.name === 'MyDay') myDayCount += days;
    if (leave.name === 'Compensatory Leave (CL)') compCount += days;
    if (leave.name === 'Personal Time Off (PTO)') ptoCount += days;

    totalBooked += days;
  });

  // Update Booked UI elements
  if (myDayBookedEl) myDayBookedEl.textContent = myDayCount;
  if (compBookedEl) compBookedEl.textContent = compCount;
  if (ptoBookedEl) ptoBookedEl.textContent = ptoCount;

  // Update Total Booked
  if (totalBookedEl) {
    totalBookedEl.textContent = totalBooked;
  }
}

function showMessage(text, isError = false) {
  const msg = document.createElement('div');

  if (isError) {
    msg.className = 'leave__submit-warning';
    msg.style.fontFamily = 'roboto';
  } else {
    msg.className = 'leave__submit-feedback';
    msg.style.fontFamily = 'roboto';
  }

  msg.textContent = text;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

updateBalanceUI();


if (upcomingSelect) {
  displayEvents(upcomingContent, upcomingSelect.value || 'both', true);
  upcomingSelect.addEventListener("change", (e) => displayEvents(upcomingContent, e.target.value, true));
}

if (pastSelect) {
  displayEvents(pastContent, pastSelect.value || 'both', false);
  pastSelect.addEventListener("change", (e) => displayEvents(pastContent, e.target.value, false));
}


if (applyBtn) {
  applyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    resetFormLabels();

    if (endInput) {
      endInput.disabled = false;
      endInput.style.opacity = '1';
      endInput.value = '';
    }

    if (startInput) startInput.min = pastLimitStr;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

if (cancelBtn) {
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('open');
    document.body.style.overflow = '';
    form.reset();
    resetFormLabels();
  });
}


const startDateLabel = document.getElementById('start-date-label');
const endDateLabel = document.getElementById('end-date-label');

function resetFormLabels() {
  if (startDateLabel) startDateLabel.textContent = "Start Date *";
  if (endDateLabel) endDateLabel.textContent = "End Date";
  if (endInput) endInput.required = false;
}

if (halfDayCheckbox) {
  halfDayCheckbox.addEventListener('change', function () {
    if (this.checked) {
      endInput.disabled = true;
      endInput.style.opacity = '0.5';
      endInput.value = '';
    } else {
      endInput.disabled = false;
      endInput.style.opacity = '1';
    }
  });
}


const today = new Date();
const minPastDate = new Date(today);
minPastDate.setMonth(today.getMonth() - 2);

const maxFutureDate = new Date(today);
maxFutureDate.setMonth(today.getMonth() + 5);

function formatForInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0'); //eg 3 march 2026 will be 03-march-2026
  return `${y}-${m}-${day}`;
}

const todayStr = formatForInput(today);
const pastLimitStr = formatForInput(minPastDate);
const futureLimitStr = formatForInput(maxFutureDate);

if (startInput) {
  // Set the range of allowed dates for the calendar inputs
  startInput.min = pastLimitStr;
  startInput.max = futureLimitStr;


  const isHoliday = (dateVal) => {
    const d = new Date(dateVal);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Format the search string to match the holiday list 04-Mar
    const search = `${String(day).padStart(2, '0')}-${monthNames[month - 1]}`;
    return upcomingHolidays.some(h => h.date.startsWith(search));
  };

  //logic to block specific dates on caledner
  const validateDay = (input) => {
    if (!input.value) return;
    const d = new Date(input.value);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
    const leaveType = leaveTypeEl.value;

    //CL EXCEPTION
    const isCLStart = (leaveType === 'Compensatory Leave (CL)' && input.id === 'start-date');

    //MY BDAY 
    if (leaveType === 'MyDay') {
      const month = d.getMonth() + 1;
      const date = d.getDate();
      if (month !== 6 || date !== 22) {
        showMessage("MyDay can only be taken on your birthday (June 22nd)!", true);
        input.value = "";
        return false;
      }
    }
    //NO WEEKEND LEAVE ALSO CL EXCEPTION
    if (!isCLStart) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        showMessage("Saturdays and Sundays are blocked!", true);
        input.value = "";
        return false;
      }
      //NO LEAVE ON HOLIDAY
      if (isHoliday(input.value)) {
        showMessage("Holidays are blocked!", true);
        input.value = "";
        return false;
      }
    }
    return true;
  };

  // Logic to execute when the Start Date is changed
  startInput.addEventListener('change', function () {
    if (!validateDay(this)) return;

    if (endInput) {
      //FROM AND TO DATE LOGIC
      endInput.min = this.value;
      if (endInput.value && endInput.value < this.value) {
        endInput.value = '';
      }
      //CONVINENT FOR USER 
      if (!endInput.value) {
        endInput.value = this.value;
      }
    }
  });

  if (endInput) {
    endInput.addEventListener('change', function () {
      validateDay(this);
    });
  }
}

//COMP OFF CHECK 
if (leaveTypeEl) {
  leaveTypeEl.addEventListener('change', function () {
    resetFormLabels();
  });
}

//SUBMIT
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const leaveType = leaveTypeEl.value;
    const startDate = startInput.value;
    const endDate = endInput.value;
    const reason = reasonEl.value.trim();
    const isHalfDay = halfDayCheckbox.checked;

    const startParts = startDate.split('-');
    const yStart = parseInt(startParts[0]);
    const mStart = parseInt(startParts[1]);
    const dStart = parseInt(startParts[2]);

    // HOLIDAY CHECK
    const checkHoliday = (d, m) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateStr = `${String(d).padStart(2, '0')}-${monthNames[m - 1]}`;
      return upcomingHolidays.some(h => h.date.includes(dateStr));
    };

    //1 DEDUCTION IF NORMAL LEAVE
    let deduction = 1;

    let startObj = new Date(yStart, mStart - 1, dStart);
    let endObj = endDate ? new Date(parseInt(endDate.split('-')[0]), parseInt(endDate.split('-')[1]) - 1, parseInt(endDate.split('-')[2])) : startObj;

    const leaveDays = [];
    const loopDate = new Date(startObj);

    while (loopDate <= endObj) {
      const d = loopDate.getDate();
      const m = loopDate.getMonth() + 1;
      const dayOfWeek = loopDate.getDay();

      // CHECK WEEKEND 0 SUNDAY 6 SATURDAY
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        loopDate.setDate(loopDate.getDate() + 1);
        continue;
      }

      // HOLIDAY CHECL
      if (checkHoliday(d, m)) {
        loopDate.setDate(loopDate.getDate() + 1);
        continue;
      }

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const dayStr = String(d).padStart(2, '0');
      const monthStr = monthNames[m - 1];
      const yearStr = loopDate.getFullYear();
      const weekdayStr = dayNames[dayOfWeek];

      const finalDate = `${dayStr}-${monthStr}-${yearStr}, ${weekdayStr}`;

      leaveDays.push({
        dateStr: finalDate,
        dateObj: new Date(loopDate)
      });

      loopDate.setDate(loopDate.getDate() + 1);
    }

    if (leaveDays.length === 0) {
      showMessage("Selected range has no valid working days (Weekends/Holidays).", true);
      return;
    }

    if (isHalfDay) {
      if (leaveDays.length > 1) {
        showMessage("Half Day cannot be applied for a date range.", true);
        return;
      }
      deduction = 0.5;
    } else {
      deduction = leaveDays.length;
    }

    // STORE DAYS IN LOCAL STORAGE
    e.target.dataset.leaveDays = JSON.stringify(leaveDays);

    const currentBalance = savedBalances[leaveType];
    if (currentBalance < deduction) {
      showMessage(`Insufficient balance! Needed: ${deduction}`, true);
      return;
    }

    //SENDING DATA TO GOOGLE FROM 
    try {
      const params = new URLSearchParams();
      params.append(googleForm.fields.leaveType, leaveType);
      params.append(googleForm.fields.reason, reason);

      //use strings to preserve Start date as  leading zeros like
      const sParts = startDate.split('-');
      params.append(googleForm.fields.startYear, sParts[0]);
      params.append(googleForm.fields.startMonth, sParts[1]);
      params.append(googleForm.fields.startDay, sParts[2]);

      const effectiveEndDate = (endDate && !isHalfDay) ? endDate : startDate;
      const eParts = effectiveEndDate.split('-');
      params.append(googleForm.fields.endYear, eParts[0]);
      params.append(googleForm.fields.endMonth, eParts[1]);
      params.append(googleForm.fields.endDay, eParts[2]);

      await fetch(googleForm.action, {
        method: 'POST',
        mode: 'no-cors',   //cors was cross origin resource sharing
        body: params.toString(),
        // headers: {
        //   'Content-Type': 'application/x-www-form-urlencoded'
        // }
      });

      // success
      savedBalances[leaveType] = savedBalances[leaveType] - deduction;
      localStorage.setItem('leaveBalances', JSON.stringify(savedBalances));

      // to handle multiple days
      if (e.target.dataset.leaveDays) {
        const ptoDays = JSON.parse(e.target.dataset.leaveDays);

        ptoDays.forEach(day => {
          let dur = 1;
          if (isHalfDay) dur = 0.5;

          const leaveEntry = {
            date: day.dateStr,
            name: leaveType,
            type: 'Leave',
            duration: dur
          };

          savedLeaves.push(leaveEntry);
          allEvents.push(leaveEntry);
        });

        // CLEAR DATASET
        delete e.target.dataset.leaveDays;
      }

      localStorage.setItem('bookedLeaves', JSON.stringify(savedLeaves));
      updateBalanceUI();

      if (upcomingSelect) displayEvents(upcomingContent, upcomingSelect.value, true);
      if (pastSelect) displayEvents(pastContent, pastSelect.value, false);

      modal.classList.remove('open');
      document.body.style.overflow = '';
      form.reset();
      resetFormLabels();
      showMessage('Leave request submitted and saved!');

    } catch (err) {
      console.error(err);
      showMessage('Submission failed — check connection.', true);
    }
  });
}
