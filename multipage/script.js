"use strict";
(() => {
  const byId = id => document.getElementById(id);
  const listen = (id, event, callback) => byId(id)?.addEventListener(event, callback);
  const data = byId("guide-steps");
  const steps = data ? JSON.parse(data.textContent) : [];
  const people = [["JUMANA A Y KHAJAH",31],["HEND I T ALDUAIJ",26],["ASHWAQ SALAH DERIE",17],["YOUSEF M D ALENEZI",8],["MANAL ELCHEIKH",4],["KHALED S M ALMARRI",3],["ZAINAB ALI ALAMER",2],["ANAS LUTFI JAMIL NAYEEH",0],["ALAA A A ALSEBAEI",0],["ZAINAB Y R ALI",0],["MARIAM M F M D ALRASHED",0]];
  if (byId("bars")) {
    byId("bars").innerHTML = people.map(p => `<div style="flex:1;height:${p[1]/35*100}%;background:#349fdc" title="${p[0]}: ${p[1]}"></div>`).join("");
    byId("barNames").innerHTML = people.map(p => `<div style="flex:1">${p[0]}</div>`).join("");
  }
  document.querySelectorAll(".chips").forEach(group => {
    group.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", "false"));
    group.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      group.querySelectorAll("button").forEach(item => {
        item.classList.toggle("on", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
    });
  });
  const tasks = {
    today: {t:"اضافة نوع انجاز",d:"06-OCT-2026",p:"Low",desc:"اضافة نوع (مهام ادارية) لانواع الانجاز"},
    launch: {t:"launching enjazaty",d:"19-AUG-2026",p:"High",desc:"launching enjazaty"},
    manual: {t:"User Manual",d:"29-SEP-2026",p:"Medium",desc:"Kindly start preparing the user manual for supervisor and employee Make sure to add the read write staus for the tasks",status:"Request"},
    testing: {t:"Testing Loading",d:"09-SEP-2026",p:"Low",desc:"Testing page loading test 1"}
  };
  const overlay = byId("overlay");
  let modalTrigger = null;
  let tourOpen = false;
  function openModal(key, focus = true) {
    if (!overlay || !tasks[key]) return;
    const task = tasks[key];
    if (!overlay.classList.contains("show")) modalTrigger = document.activeElement;
    byId("mTitle").textContent = task.t;
    byId("mDate").textContent = task.d;
    byId("mPri").textContent = task.p;
    byId("mDesc").textContent = task.desc;
    byId("mStatus").textContent = task.status || "Submitted";
    byId("mStatus").classList.toggle("req", task.status === "Request");
    overlay.classList.add("show");
    if (focus) byId("mClose").focus();
  }
  function closeModal(restore = true) {
    if (!overlay?.classList.contains("show")) return;
    overlay.classList.remove("show");
    if (restore && modalTrigger?.isConnected) modalTrigger.focus({preventScroll:true});
  }
  function dismissModal() {
    if (tourOpen) hideTour();
    closeModal();
  }
  listen("mClose", "click", dismissModal);
  listen("mClose2", "click", dismissModal);
  overlay?.addEventListener("click", event => {
    if (event.target === overlay) dismissModal();
  });
  listen("todayOpen", "click", () => openModal("today"));
  document.querySelectorAll("#cards .card").forEach((card, index) => {
    card.querySelector("button")?.addEventListener("click", () => openModal(["today","manual","testing","launch"][index]));
  });
  listen("addBtn", "click", () => { window.location.href = "02-add-task.html"; });

  // Keep the original October demo as the reference date for calendar controls.
  let year = 2026, month = 9, listView = false;
  const calTable = byId("calTable");
  const calendarEvents = [{year:2026,month:8,day:29,key:"manual",id:"evManual",color:"#9ca3af"},{year:2026,month:9,day:6,key:"today",id:"evToday",color:"#2e7d32"}];
  function eventMarkup(event) {
    return `<button type="button" class="ev" id="${event.id}" data-task="${event.key}" style="background:${event.color}${event.key === "today" ? ";direction:rtl" : ""}">${tasks[event.key].t}</button>`;
  }
  function buildCalendar() {
    if (!calTable) return;
    const heading = byId("calNav").nextElementSibling;
    heading.textContent = new Date(year, month, 1).toLocaleDateString("en-US", {month:"long",year:"numeric"});
    let list = byId("calendar-list");
    if (!list) {
      list = document.createElement("div");
      list.id = "calendar-list";
      list.className = "calendar-list";
      calTable.after(list);
    }
    calTable.hidden = listView;
    list.hidden = !listView;
    if (listView) {
      calTable.innerHTML = "";
      list.replaceChildren();
      calendarEvents.filter(event => event.year === year && event.month === month).forEach(event => {
        const row = document.createElement("div");
        row.textContent = `${event.day} ${heading.textContent}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ev";
        button.id = event.id;
        button.dataset.task = event.key;
        button.style.background = event.color;
        if (event.key === "today") button.style.direction = "rtl";
        button.textContent = tasks[event.key].t;
        row.append(button);
        list.append(row);
      });
      if (!list.childElementCount) {
        const message = document.createElement("p");
        message.textContent = "No tasks / لا توجد مهام";
        list.append(message);
      }
    } else {
      list.innerHTML = "";
      const first = new Date(year, month, 1).getDay();
      const count = new Date(year, month + 1, 0).getDate();
      let html = "<thead><tr>" + ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => `<th scope="col">${day}</th>`).join("") + "</tr></thead><tbody>";
      for (let i = 0; i < Math.ceil((first + count) / 7) * 7; i++) {
        if (i % 7 === 0) html += "<tr>";
        const date = new Date(year, month, i - first + 1);
        const day = date.getDate();
        const muted = date.getMonth() !== month;
        const today = date.getFullYear() === 2026 && date.getMonth() === 9 && day === 6;
        const event = calendarEvents.find(item => item.year === date.getFullYear() && item.month === date.getMonth() && item.day === day);
        html += `<td class="${muted ? "muted" : ""} ${today ? "today" : ""}">${day}${event ? eventMarkup(event) : ""}</td>`;
        if (i % 7 === 6) html += "</tr>";
      }
      calTable.innerHTML = html + "</tbody>";
    }
    byId("calView").querySelectorAll("button").forEach((button,index) => button.setAttribute("aria-pressed", String(Boolean(index) === listView)));
  }
  if (calTable) {
    buildCalendar();
    calTable.parentElement.addEventListener("click", event => {
      const button = event.target.closest("[data-task]");
      if (button) openModal(button.dataset.task);
    });
    byId("calNav").querySelectorAll("button").forEach((button,index) => button.addEventListener("click", () => {
      if (index === 2) { year = 2026; month = 9; }
      else {
        const date = new Date(year, month + (index === 0 ? -1 : 1), 1);
        year = date.getFullYear(); month = date.getMonth();
      }
      buildCalendar();
    }));
    byId("calView").querySelectorAll("button").forEach((button,index) => button.addEventListener("click", () => { listView = index === 1; buildCalendar(); }));
  }

  const tip = byId("tip"), spot = byId("spot"), help = byId("help");
  let stepIndex = 0;
  function place() {
    if (!tourOpen) return;
    const element = byId(steps[stepIndex].el);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const left = Math.max(3, rect.left - 5), top = Math.max(3, rect.top - 5);
    Object.assign(spot.style, {
      left: `${left}px`, top: `${top}px`,
      width: `${Math.max(0,Math.min(innerWidth - 3,rect.right + 5) - left)}px`,
      height: `${Math.max(0,Math.min(innerHeight - 3,rect.bottom + 5) - top)}px`
    });
    const width = tip.offsetWidth, height = tip.offsetHeight;
    let tipTop = rect.bottom + 14;
    if (tipTop + height > innerHeight - 10) tipTop = rect.top - height - 14;
    tip.style.left = `${Math.max(10,Math.min(rect.left,innerWidth - width - 10))}px`;
    tip.style.top = `${Math.max(10,Math.min(tipTop,innerHeight - height - 10))}px`;
  }
  function renderStep() {
    const step = steps[stepIndex];
    if (!step || !tourOpen) return;
    if (calTable && step.el === "evToday") {
      year = 2026; month = 9; listView = false; buildCalendar();
    }
    if (step.modal) openModal(step.modal, false);
    else closeModal(false);
    byId("tipEn").textContent = step.en;
    byId("tipAr").textContent = step.ar;
    byId("tipCount").textContent = `${stepIndex + 1} / ${steps.length}`;
    byId("tipBack").disabled = stepIndex === 0;
    byId("tipNext").textContent = stepIndex === steps.length - 1 ? "Restart ↺" : "Next →";
    byId(step.el)?.scrollIntoView({block:"center",behavior:"instant"});
    requestAnimationFrame(place);
  }
  function go(index) {
    stepIndex = (index + steps.length) % steps.length;
    renderStep();
  }
  function hideTour() {
    tourOpen = false;
    tip.hidden = spot.hidden = true;
    help.hidden = false;
    closeModal(false);
    help.focus({preventScroll:true});
  }
  function showTour() {
    if (!steps.length) return;
    tourOpen = true;
    tip.hidden = spot.hidden = false;
    help.hidden = true;
    renderStep();
    byId("tipX").focus({preventScroll:true});
  }
  listen("tipX", "click", hideTour);
  listen("help", "click", showTour);
  listen("tipNext", "click", () => go(stepIndex + 1));
  listen("tipBack", "click", () => go(stepIndex - 1));
  addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (tourOpen) hideTour();
      else closeModal();
      return;
    }
    const dialog = tourOpen ? tip : overlay?.classList.contains("show") ? byId("modal") : null;
    if (dialog && event.key === "Tab") {
      const items = [...dialog.querySelectorAll("button,a[href],input,select,textarea")].filter(item => !item.disabled && !item.hidden);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    }
    if (!tourOpen || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    if (event.key === "ArrowRight") { event.preventDefault(); go(stepIndex + 1); }
    if (event.key === "ArrowLeft" && stepIndex > 0) { event.preventDefault(); go(stepIndex - 1); }
  });
  addEventListener("resize", place);
  document.addEventListener("scroll", place, true);
})();
