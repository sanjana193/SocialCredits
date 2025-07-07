const apiBase = `http://localhost:3000/api/admin`;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  
});

async function loadDashboard() {
  const [users, logs, requests, notices] = await Promise.all([
    fetch(`${apiBase}/users`).then(r => r.json()),
    fetch(`${apiBase}/logs`).then(r => r.json()),
    fetch(`${apiBase}/requests`).then(r => r.json()),
    fetch(`http://localhost:3000/api/notices/all`).then(r => r.json())
  ]);

  populateUsers(users);
  populateLogs(logs);
  populateRequests(requests);
  populateLeaderboard(users);
  renderCharts(users, logs);
  populateNotices(notices);
  loadAllLeaves();
  loadOverview();
}

document.getElementById('noticeForm').addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('noticeTitle').value.trim();
  const content = document.getElementById('noticeContent').value.trim();
  const targetAudience = document.getElementById('noticeAudience').value;
  const department = document.getElementById('noticeDepartment').value.trim();
  const year = document.getElementById('noticeYear').value;
  const validTill = document.getElementById('noticeValidTill').value;

  fetch(`http://localhost:3000/api/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title, content, createdBy: 'ADMIN_ID',
      targetAudience, department: department || undefined,
      year: year || undefined, validTill: validTill || undefined
    })
  })
  .then(res => res.json())
  .then(() => {
    alert('Notice created');
    document.getElementById('noticeForm').reset();
    loadDashboard();
  });
});

function populateUsers(users) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const row = tbody.insertRow();
    row.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.credits}</td>`;
  });
}

function populateLogs(logs) {
  const tbody = document.querySelector('#logsTable tbody');
  tbody.innerHTML = '';
  logs.forEach(l => {
    const row = tbody.insertRow();
    row.innerHTML = `<td>${l.from_user.name}</td><td>${l.to_user.name}</td><td>${l.task}</td><td>${l.hours}</td>`;
  });
}

function populateRequests(reqs) {
  const tbody = document.querySelector('#requestsTable tbody');
  tbody.innerHTML = '';
  reqs.forEach(r => {
    const row = tbody.insertRow();
    const fulfiller = r.fulfilled_by?.name || 'N/A';
    row.innerHTML = `<td>${r.by_user.name}</td><td>${r.task}</td><td>${r.credits_used}</td><td>${r.status}</td><td>${fulfiller}</td>`;
  });
}

function populateLeaderboard(users) {
  const sorted = [...users].sort((a, b) => b.credits - a.credits).slice(0, 3);
  const board = document.getElementById('leaderboardCards');
  board.innerHTML = '';
  sorted.forEach((u, i) => {
    board.innerHTML += `
      <div class="col-md-4">
        <div class="card text-white bg-success mb-3">
          <div class="card-header">#${i + 1}</div>
          <div class="card-body">
            <h5 class="card-title">${u.name}</h5>
            <p class="card-text">${u.credits} Credits</p>
          </div>
        </div>
      </div>`;
  });
}

function populateNotices(notices) {
  const tbody = document.querySelector('#noticesTable tbody');
  tbody.innerHTML = '';
  if (!notices.length) {
    tbody.innerHTML = `<tr><td colspan="6">No notices available</td></tr>`;
    return;
  }

  notices.forEach(n => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${n.title}</td><td>${n.content}</td><td>${n.targetAudience}</td>
      <td>${n.department || '-'}</td><td>${n.year || '-'}</td>
      <td>${n.validTill ? new Date(n.validTill).toLocaleDateString() : '-'}</td>`;
  });
}

function loadAllLeaves() {
  fetch(`http://localhost:3000/api/leave/all`)
    .then(r => r.json())
    .then(leaves => {
      const container = document.getElementById('allLeaves');
      container.innerHTML = '';

      if (!leaves.length) {
        container.innerHTML = `<li class="list-group-item">No leave requests.</li>`;
        return;
      }

      const ul = document.createElement('ul');
      ul.className = 'list-group';

      leaves.forEach(l => {
        const li = document.createElement('li');
        li.id = `leave-${l._id}`;
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const statusBadge = `<span class="badge bg-${l.status === 'Approved' ? 'success' : (l.status === 'Rejected' ? 'danger' : 'secondary')}">${l.status}</span>`;

        let actionsHTML = '';
        if (l.status === 'Pending') {
          actionsHTML = `
            <button class="btn btn-sm btn-success me-1" onclick="updateLeaveStatus('${l._id}', 'approve')">Approve</button>
            <button class="btn btn-sm btn-danger" onclick="updateLeaveStatus('${l._id}', 'reject')">Reject</button>
          `;
        }

        li.innerHTML = `
          <div>
            <strong>${l.user.name}</strong> - ${l.type} leave 
            (${new Date(l.fromDate).toLocaleDateString()} → ${new Date(l.toDate).toLocaleDateString()}): 
            ${l.reason} 
            ${statusBadge}
          </div>
          <div>
            ${actionsHTML}
          </div>
        `;

        ul.appendChild(li);
      });

      container.appendChild(ul);
    })
    .catch(err => {
      console.error(err);
      document.getElementById('allLeaves').innerHTML = 'Error loading leaves.';
    });
}


function updateLeaveStatus(leaveId, action) {
  adminId = '686a26bada9584d7407b0d29';
  localStorage.setItem('adminId', adminId);
  if (!adminId) {
    alert('Admin ID not found! Please log in again.');
    return;
  }

  fetch(`http://localhost:3000/api/leave/${leaveId}/${action}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId })
  })
    .then(res => res.json())
    .then(data => {
      alert(`Leave ${action}d`);
      loadAllLeaves();
    })
    .catch(err => {
      console.error(err);
      alert('Error: ' + err.message);
    });
}


function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function statusColor(status) {
  switch (status) {
    case 'Approved': return 'success';
    case 'Rejected': return 'danger';
    default: return 'warning';
  }
}

function renderCharts(users, logs) {
  const creditsCtx = document.getElementById('creditsChart').getContext('2d');
  const tasksCtx = document.getElementById('tasksChart').getContext('2d');

  const userHoursMap = {};
  logs.forEach(l => {
    if (!userHoursMap[l.from_user._id]) userHoursMap[l.from_user._id] = { name: l.from_user.name, hours: 0 };
    userHoursMap[l.from_user._id].hours += l.hours || 0;
  });

  const sortedUsers = Object.values(userHoursMap).sort((a, b) => b.hours - a.hours).slice(0, 5);

  new Chart(creditsCtx, {
    type: 'bar',
    data: {
      labels: sortedUsers.map(u => u.name),
      datasets: [{
        label: 'Hours Helping Others',
        data: sortedUsers.map(u => u.hours),
        backgroundColor: 'rgba(75, 192, 192, 0.7)'
      }]
    }
  });

  const taskCounts = {};
  logs.forEach(l => {
    taskCounts[l.task] = (taskCounts[l.task] || 0) + 1;
  });

  new Chart(tasksCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(taskCounts),
      datasets: [{
        data: Object.values(taskCounts),
        backgroundColor: ['#f88','#8f8','#88f','#ff8','#8ff']
      }]
    }
  });
}

function filterTables() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  document.querySelectorAll('table tbody tr').forEach(row => {
    row.style.display = [...row.cells].some(c => c.innerText.toLowerCase().includes(q)) ? '' : 'none';
  });
}
function loadOverview() {
  fetch(`http://localhost:3000/api/admin/overview`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById('tusers').textContent = data.tusers;
      document.getElementById('trequests').textContent = data.trequests;
      document.getElementById('thelpLogs').textContent = data.thelpLogs;
      document.getElementById('tleaves').textContent = data.tleaves;
      document.getElementById('tnotices').textContent = data.tnotices;
    })
    .catch(err => {
      console.error(err);
      alert('Failed to load overview data');
    });
}
