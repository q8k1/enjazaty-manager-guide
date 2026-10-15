"use strict";
(() => {
  const byId = id => document.getElementById(id);
  const listen = (id, event, callback) => byId(id)?.addEventListener(event, callback);
  const teamTasks = window.enjazatyTeamTasks || [];
  const taskDate = date => {
    const [year,month,day] = date.split("-");
    return `${day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(month) - 1]} ${year}`;
  };
  const tip = byId("tip");
  const overlay = byId("managerOverlay");
  const modal = byId("managerModal");
  let modalTrigger = null;
  function openModal(focus = true) {
    if (!overlay) return;
    if (!overlay.classList.contains("show")) modalTrigger = document.activeElement;
    overlay.classList.add("show");
    if (focus) modal.querySelector("[data-manager-close]").focus();
  }
  function closeModal(restore = true) {
    if (!overlay?.classList.contains("show")) return;
    overlay.classList.remove("show");
    if (restore) {
      const target = modalTrigger?.isConnected ? modalTrigger : byId("help");
      target?.focus({preventScroll:true});
    }
  }
  function dismissModal() {
    if (!tip.hidden) byId("tipX").click();
    closeModal();
  }
  document.querySelectorAll("[data-manager-close]").forEach(button => button.addEventListener("click", dismissModal));
  overlay?.addEventListener("click", event => {
    if (event.target === overlay) dismissModal();
  });
  addEventListener("keydown", event => {
    if (!overlay?.classList.contains("show") || !tip.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      const items = [...modal.querySelectorAll("button,input,select,textarea")].filter(item => !item.disabled && !item.hidden);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    }
  });

  const rewardRows = byId("rewardRows");
  const rewardTemplates = rewardRows ? [...rewardRows.children].map(row => row.cloneNode(true)) : [];
  const rewardTasks = rewardRows ? Array.from({length:38}, (_, index) => {
    const task = teamTasks[index % teamTasks.length];
    return {
      ...task, id:index, date:taskDate(task.date),
      description:task.title,
      status:index === 37 ? "Assigned" : "Submitted", points:0
    };
  }) : [];
  let rewardStatus = "Submitted", rewardPage = 1, selectedTask = null;
  function renderRewards() {
    if (!rewardRows) return;
    const tasks = rewardTasks.filter(task => task.status === rewardStatus);
    const pageCount = Math.max(1, Math.ceil(tasks.length / 7));
    rewardPage = Math.min(pageCount, Math.max(1,rewardPage));
    const start = (rewardPage - 1) * 7;
    rewardRows.replaceChildren();
    tasks.slice(start,start + 7).forEach((task,index) => {
      const row = rewardTemplates[task.id % rewardTemplates.length].cloneNode(true);
      row.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
      const detail = row.querySelector("[data-detail]");
      detail.dataset.detail = task.id;
      detail.setAttribute("aria-label", `Details: ${task.title}, ${task.employee}`);
      if (index === 0) {
        detail.id = "rewardDetails";
        row.querySelector(".reward-points").id = "rewardPoints";
      }
      [task.employee,task.title,task.type,task.priority,task.date].forEach((value,i) => { row.cells[i + 1].textContent = value; });
      row.querySelectorAll("[data-reward]").forEach(button => {
        button.dataset.reward = task.id;
        button.disabled = rewardStatus !== "Submitted";
        button.setAttribute("aria-pressed", String(task.points === Number(button.dataset.points)));
        button.setAttribute("aria-label", `${button.dataset.points} points: ${task.title}, ${task.employee}`);
      });
      rewardRows.append(row);
    });
    if (!tasks.length) {
      const cell = rewardRows.insertRow().insertCell();
      cell.colSpan = 7;
      cell.textContent = "No tasks / لا توجد مهام";
    }
    byId("rewardRange").textContent = tasks.length ? `${start + 1}–${Math.min(start + 7,tasks.length)} of ${tasks.length}` : "0 of 0";
    byId("rewardPagination").querySelectorAll("[data-page]").forEach(button => {
      const page = button.dataset.page;
      button.removeAttribute("aria-current");
      if (Number(page) === rewardPage) button.setAttribute("aria-current", "page");
      button.disabled = page === "prev" ? rewardPage === 1 : page === "next" ? rewardPage === pageCount : Number(page) > pageCount;
    });
  }
  function showTask(task, focus = true) {
    if (!task) return;
    selectedTask = task;
    byId("detailEmployee").textContent = task.employee;
    byId("detailDate").textContent = task.date;
    byId("detailType").textContent = task.type;
    byId("detailTitle").textContent = task.title;
    byId("detailDescription").textContent = task.description;
    byId("returnTask").disabled = byId("rejectTask").disabled = task.status !== "Submitted";
    openModal(focus);
  }
  listen("rewardTabs", "click", event => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    rewardStatus = button.dataset.status; rewardPage = 1;
    byId("rewardTabs").querySelectorAll("button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderRewards();
  });
  listen("rewardRows", "click", event => {
    const detail = event.target.closest("[data-detail]");
    if (detail) showTask(rewardTasks[Number(detail.dataset.detail)]);
    const button = event.target.closest("[data-reward]");
    if (!button) return;
    const task = rewardTasks[Number(button.dataset.reward)];
    if (task.status !== "Submitted") return;
    task.points = Number(button.dataset.points);
    byId("rewardResult").textContent = `Demo: ${task.points} points for ${task.employee} / توضيح: تم اختيار ${task.points} نقاط`;
    button.parentElement.querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  });
  listen("rewardPagination", "click", event => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const page = button.dataset.page;
    rewardPage = page === "prev" ? rewardPage - 1 : page === "next" ? rewardPage + 1 : Number(page);
    renderRewards();
  });
  [["returnTask","Returned"],["rejectTask","Rejected"]].forEach(([id,status]) => listen(id, "click", () => {
    if (!selectedTask || selectedTask.status !== "Submitted") return;
    selectedTask.status = status;
    byId("rewardResult").textContent = `Demo: ${status} / توضيح: ${status === "Returned" ? "أُعيدت المهمة للمراجعة" : "رُفضت المهمة"}`;
    dismissModal();
    renderRewards();
    byId("rewardTabs").querySelector("button.active").focus();
  }));
  renderRewards();

  listen("assignForm", "submit", event => {
    event.preventDefault();
    byId("assignResult").textContent = `Demo: task assigned to ${byId("assignee").value}. No data sent. / توضيح: تم إسناد المهمة دون إرسال بيانات.`;
  });

  const projectRows = byId("projectRows");
  const projectTemplate = projectRows?.firstElementChild.cloneNode(true);
  const projects = projectRows ? [...projectRows.children].map((row,id) => ({
    id,name:row.cells[1].textContent,creator:row.cells[2].textContent,
    created:row.cells[3].textContent,updater:row.cells[4].textContent,
    updated:row.cells[5].textContent,department:row.cells[6].textContent
  })) : [];
  let nextProjectId = projects.length, selectedProject = null;
  function renderProjects() {
    if (!projectRows) return;
    projectRows.replaceChildren();
    projects.forEach((project,index) => {
      const row = projectTemplate.cloneNode(true);
      const button = row.querySelector("button");
      button.removeAttribute("id");
      if (index === 0) button.id = "projectDetails";
      button.dataset.project = project.id;
      button.setAttribute("aria-label", `Details: ${project.name}`);
      [project.name,project.creator,project.created,project.updater,project.updated,project.department].forEach((value,i) => { row.cells[i + 1].textContent = value; });
      projectRows.append(row);
    });
    if (!projects.length) {
      const cell = projectRows.insertRow().insertCell();
      cell.colSpan = 7; cell.textContent = "No projects / لا توجد مشاريع";
    }
    byId("projectRange").textContent = projects.length ? `1 - ${projects.length}` : "0 - 0";
  }
  function showProject(project, focus = true) {
    if (!project) return;
    selectedProject = project;
    byId("editProjectName").value = project.name;
    byId("editProjectDept").value = project.department;
    byId("editCreatedDate").value = project.created;
    byId("editCreatedBy").value = project.creator;
    openModal(focus);
  }
  listen("projectRows", "click", event => {
    const button = event.target.closest("[data-project]");
    if (button) showProject(projects.find(project => project.id === Number(button.dataset.project)));
  });
  listen("projectForm", "submit", event => {
    event.preventDefault();
    const name = byId("projectName").value.trim();
    if (!name) { byId("projectName").focus(); return; }
    projects.push({id:nextProjectId++,name,department:byId("projectDept").value,creator:"نادر الوادي",created:"06/10/2026",updater:"نادر الوادي",updated:"06/10/2026"});
    renderProjects(); event.target.reset();
    byId("projectResult").textContent = "Demo: project added. / توضيح: أُضيف المشروع.";
  });
  listen("editProjectForm", "submit", event => {
    event.preventDefault();
    const name = byId("editProjectName").value.trim();
    if (!selectedProject || !name) return;
    selectedProject.name = name;
    selectedProject.department = byId("editProjectDept").value;
    selectedProject.updater = "نادر الوادي"; selectedProject.updated = "06/10/2026";
    dismissModal(); renderProjects();
    byId("projectDetails")?.focus();
    byId("projectResult").textContent = "Demo: project updated. / توضيح: تم تحديث المشروع.";
  });
  listen("deleteProject", "click", () => {
    const index = projects.indexOf(selectedProject);
    if (index < 0) return;
    projects.splice(index,1);
    dismissModal(); renderProjects();
    (byId("projectDetails") || byId("projectName")).focus();
    byId("projectResult").textContent = "Demo: project deleted. / توضيح: حُذف المشروع.";
  });

  const cards = byId("cards");
  const taskCards = cards ? [...cards.children] : [];
  const teamCards = byId("teamCards");
  function textElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function showTeamTask(task, focus = true) {
    if (!task) return;
    byId("teamDetailTitle").textContent = task.title;
    byId("teamDetailEmployee").textContent = task.employee;
    byId("teamDetailDate").textContent = taskDate(task.date);
    byId("teamDetailType").textContent = task.type;
    byId("teamDetailPriority").textContent = task.priority;
    byId("teamDetailDescription").textContent = task.title;
    openModal(focus);
  }
  if (teamCards) teamTasks.forEach((task,index) => {
    const card = document.createElement("article");
    card.className = "card";
    if (index === 0) card.id = "teamTaskCard";
    card.append(textElement("h4",task.title));
    card.append(textElement("span","Submitted","badge"));
    card.append(textElement("div",task.employee,"team-employee"));
    card.append(textElement("div",`Task Type: ${task.type}`,"pill"));
    card.append(textElement("div",`Priority: ${task.priority}`,"pill"));
    const foot = textElement("div",taskDate(task.date),"foot");
    const button = textElement("button","Open","btn-yellow");
    button.type = "button";
    button.setAttribute("aria-label",`Open: ${task.title}, ${task.employee}`);
    button.addEventListener("click", () => showTeamTask(task));
    foot.append(button); card.append(foot); teamCards.append(card);
  });
  const teamTaskCards = teamCards ? [...teamCards.children] : [];
  let teamView = false, timeFilter = 0, statusFilter = 0;
  function renderView() {
    if (!cards) return;
    const search = byId("searchF").value.trim().toLowerCase();
    const dates = byId("rangeF").querySelectorAll("input");
    const start = dates[0].value, end = dates[1].value;
    const taskDates = ["2026-10-06","2026-09-29","2026-09-09","2026-08-19"];
    const taskStatuses = [1,2,1,1];
    function matches(date,status,text,today) {
      const timeMatches = timeFilter === 0 || (timeFilter === 1 ? date === today : timeFilter === 2 ? date >= "2026-10-04" && date <= today : date.startsWith("2026-10"));
      return timeMatches && (statusFilter === 0 || status === statusFilter) && (!start || date >= start) && (!end || date <= end) && text.toLowerCase().includes(search);
    }
    cards.hidden = teamView;
    teamCards.hidden = !teamView;
    taskCards.forEach((card,index) => {
      card.hidden = teamView || !matches(taskDates[index],taskStatuses[index],card.textContent,"2026-10-06");
    });
    teamTaskCards.forEach((card,index) => {
      card.hidden = !teamView || !matches(teamTasks[index].date,1,card.textContent,"2026-10-07");
    });
    byId("emptyTasks").hidden = teamView || taskCards.some(card => !card.hidden);
    byId("emptyTeamTasks").hidden = !teamView || teamTaskCards.some(card => !card.hidden);
    byId("stats").querySelectorAll("b").forEach((counter,index) => { counter.textContent = (teamView ? [teamTasks.length,0,0,teamTasks.length,0] : [4,1,0,3,0])[index]; });
    byId("statusF").querySelectorAll("button").forEach((button,index) => { button.textContent = `${["All","Submitted","Assigned","Needs review","Canceled"][index]} ${(teamView ? [teamTasks.length,teamTasks.length,0,0,0] : [4,3,1,0,0])[index]}`; });
  }
  function selectButton(group,selected) {
    group.querySelectorAll("button").forEach(button => {
      button.classList.toggle("on", button === selected);
      button.setAttribute("aria-pressed", String(button === selected));
    });
  }
  ["timeF","statusF"].forEach(id => {
    const group = byId(id);
    group?.querySelectorAll("button").forEach((button,index) => {
      button.setAttribute("aria-pressed", String(index === 0));
      button.addEventListener("click", () => {
        if (id === "timeF") timeFilter = index;
        else statusFilter = index;
        selectButton(group,button); renderView();
      });
    });
  });
  listen("taskTabs", "click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    teamView = button.id === "teamTasks";
    byId("taskTabs").querySelectorAll("button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderView();
  });
  listen("searchF", "input", renderView);
  byId("rangeF")?.querySelectorAll("input").forEach(input => input.addEventListener("change",renderView));
  byId("rangeF")?.querySelector("button").addEventListener("click", () => {
    byId("rangeF").querySelectorAll("input").forEach(input => { input.value = ""; });
    renderView();
  });
  byId("viewT")?.querySelectorAll("button").forEach((button,index) => {
    button.setAttribute("aria-label", index ? "List view / عرض القائمة" : "Grid view / عرض البطاقات");
    button.setAttribute("aria-pressed", String(index === 0));
    button.addEventListener("click", () => {
      cards.classList.toggle("list", index === 1);
      teamCards.classList.toggle("list", index === 1);
      byId("viewT").querySelectorAll("button").forEach(item => {
        item.setAttribute("aria-pressed", String(item === button));
        item.style.background = item === button ? "#0b2a4a" : "#fff";
        item.style.color = item === button ? "#fff" : "#1f2937";
      });
    });
  });
  renderView();

  // Observe the shared tour instead of changing the worker's script.
  const steps = JSON.parse(byId("guide-steps").textContent);
  let wasTourOpen = false;
  function syncTour() {
    if (tip.hidden) { wasTourOpen = false; closeModal(false); return; }
    if (!wasTourOpen) {
      if (rewardRows) {
        rewardTasks[0].status = "Submitted";
        byId("rewardTabs").querySelector("[data-status='Submitted']").click();
      }
      if (projectRows && !projects.length) {
        const cells = projectTemplate.cells;
        projects.push({id:nextProjectId++,name:cells[1].textContent,creator:cells[2].textContent,created:cells[3].textContent,updater:cells[4].textContent,updated:cells[5].textContent,department:cells[6].textContent});
        renderProjects();
      }
      if (cards) {
        byId("myTasks").click();
        byId("searchF").value = "";
        byId("rangeF").querySelector("button").click();
        byId("timeF").querySelector("button").click();
        byId("statusF").querySelector("button").click();
      }
    }
    wasTourOpen = true;
    const index = Number(byId("tipCount").textContent.split("/")[0]) - 1;
    byId("tipNext").textContent = index === steps.length - 1 ? "End / إنهاء" : "Next →";
    const step = steps[index];
    if (cards) {
      const teamStep = step?.el === "teamTaskCard" || step?.el === "teamDetail";
      if (teamView !== teamStep) byId(teamStep ? "teamTasks" : "myTasks").click();
    }
    if (step?.modal === "reward") showTask(rewardTasks[0],false);
    else if (step?.modal === "project") showProject(projects[0],false);
    else if (step?.modal === "team") showTeamTask(teamTasks[0],false);
    else closeModal(false);
    if (step) byId(step.el)?.scrollIntoView({block:"center",behavior:"instant"});
  }
  const observer = new MutationObserver(syncTour);
  observer.observe(tip, {attributes:true,attributeFilter:["hidden"]});
  observer.observe(byId("tipCount"), {childList:true});
  function lastStep() {
    return !tip.hidden && Number(byId("tipCount").textContent.split("/")[0]) === steps.length;
  }
  byId("tipNext").addEventListener("click", event => {
    if (!lastStep()) return;
    event.stopImmediatePropagation();
    byId("tipX").click();
  }, true);
  addEventListener("keydown", event => {
    if (event.key !== "ArrowRight" || !lastStep() || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    byId("tipX").click();
  }, true);
  listen("help", "click", () => {
    while (Number(byId("tipCount").textContent.split("/")[0]) > 1) byId("tipBack").click();
  });

  const welcome = document.createElement("dialog");
  welcome.className = "tour-welcome";
  welcome.id = "tourWelcome";
  welcome.setAttribute("aria-labelledby","welcomeTitle");
  welcome.setAttribute("aria-describedby","welcomeDescription");
  const title = textElement("h2","مرحباً بك في دليل المدير");
  title.id = "welcomeTitle";
  title.dir = "rtl";
  const description = textElement("p","اضغط ابدأ لبدء الشرح التفاعلي لهذه الصفحة.");
  description.id = "welcomeDescription";
  description.dir = "rtl";
  const english = textElement("p","Start the interactive guide for this page.");
  english.lang = "en";
  const actions = document.createElement("div");
  actions.className = "welcome-actions";
  const start = textElement("button","ابدأ","btn-dark");
  start.id = "startTour";
  start.type = "button";
  const skip = textElement("button","لاحقاً / Later","btn");
  skip.type = "button";
  start.addEventListener("click", () => {
    welcome.close();
    byId("help").click();
    document.fonts.ready.then(() => dispatchEvent(new Event("resize")));
  });
  skip.addEventListener("click", () => welcome.close());
  welcome.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === start) {
      event.preventDefault(); skip.focus();
    } else if (!event.shiftKey && document.activeElement === skip) {
      event.preventDefault(); start.focus();
    }
  });
  welcome.addEventListener("close", () => {
    if (tip.hidden) byId("help").focus({preventScroll:true});
  });
  actions.append(start,skip);
  welcome.append(title,description,english,actions);
  document.body.append(welcome);
  welcome.showModal();
  start.focus({preventScroll:true});
})();
