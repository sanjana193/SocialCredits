const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

if (!userId) alert("Please login properly");

const api = `http://localhost:3000/api`;

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadUsers();
  loadLogs();
  loadPendingApprovals();
  loadRequests();
  loadAttendance();
  loadAssignments();
  loadStudentLeaves();

  document.getElementById('logHelpForm').addEventListener('submit', logHelp);
  document.getElementById('requestHelpForm').addEventListener('submit', requestHelp);
  document.getElementById('studentLeaveForm').addEventListener('submit', submitStudentLeave);
});

function loadProfile() {
  fetch(`${api}/user/${userId}`)
    .then(r => r.json())
    .then(u => {
      document.getElementById('myName').textContent = u.name;
      document.getElementById('myCredits').textContent = u.credits;

      const params = new URLSearchParams({ role: 'students', department: u.department, year: u.year });
      fetch(`${api}/notices?${params}`)
        .then(r => r.json())
        .then(populateNotices);
    });
}

function populateNotices(notices) {
  const tbody = document.querySelector('#noticesTable tbody');
  tbody.innerHTML = '';
  if (!notices.length) {
    tbody.innerHTML = `<tr><td colspan="6">No notices available for you.</td></tr>`;
    return;
  }
  notices.forEach(n => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${n.title}</td>
      <td>${n.content}</td>
      <td>${n.targetAudience}</td>
      <td>${n.department || '-'}</td>
      <td>${n.year || '-'}</td>
      <td>${new Date(n.validTill).toLocaleDateString()}</td>`;
  });
}

function loadUsers() {
  fetch(`${api}/admin/users`)
    .then(r => r.json())
    .then(users => {
      const sel = document.getElementById('toUserId');
      sel.innerHTML = `<option value="">-- Select User --</option>`;
      users.forEach(u => {
        if (u._id !== userId) {
          const opt = document.createElement('option');
          opt.value = u._id;
          opt.textContent = `${u.name} (${u.email})`;
          sel.appendChild(opt);
        }
      });
    });
}

function loadLogs() {
  fetch(`${api}/help/mylogs/${userId}`)
    .then(r => r.json())
    .then(logs => {
      const ul = document.getElementById('myLogs');
      ul.innerHTML = logs.length ? '' : 'No logs yet.';
      logs.forEach(l => {
        const li = document.createElement('li');
        li.textContent = `${l.from_user.name} helped ${l.to_user.name} with ${l.task} — ${l.status}`;
        ul.appendChild(li);
      });
    });
}

function loadPendingApprovals() {
  fetch(`${api}/help/pendingApprovals/${userId}`)
    .then(r => r.json())
    .then(logs => {
      const ul = document.getElementById('pendingApprovals');
      ul.innerHTML = logs.length ? '' : 'No pending approvals.';
      logs.forEach(l => {
        const li = document.createElement('li');
        li.textContent = `${l.from_user.name} claims help with ${l.task}`;
        ['Approve', 'Reject'].forEach(action => {
          const btn = document.createElement('button');
          btn.textContent = action;
          btn.className = `btn btn-${action === 'Approve' ? 'success' : 'danger'} btn-sm`;
          btn.onclick = () => handleApproval(l._id, action.toLowerCase());
          li.appendChild(btn);
        });
        ul.appendChild(li);
      });
    });
}

function loadRequests() {
  fetch(`${api}/request/generalPending/${userId}`)
    .then(r => r.json())
    .then(reqs => {
      const ul = document.getElementById('availableRequests');
      ul.innerHTML = reqs.length ? '' : 'No requests.';
      reqs.forEach(rq => {
        const li = document.createElement('li');
        li.textContent = `${rq.by_user.name} needs help with ${rq.task} (${rq.credits_used} credits)`;
        const btn = document.createElement('button');
        btn.textContent = 'Fulfill';
        btn.className = 'btn btn-primary btn-sm';
        btn.onclick = () => fulfillRequest(rq._id);
        li.appendChild(btn);
        ul.appendChild(li);
      });
    });
}

function loadAttendance() {
  fetch(`${api}/attendance/user/${userId}`)
    .then(r => r.json())
    .then(records => {
      const ul = document.getElementById('myAttendance');
      ul.innerHTML = records.length ? '' : '<li>No attendance records yet.</li>';
      records.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `${r.subject}: ${r.status} (${new Date(r.date).toLocaleDateString()})`;
        ul.appendChild(li);
      });
    });
}

function loadAssignments() {
  fetch(`${api}/assignment/user/${userId}`)
    .then(r => r.json())
    .then(tasks => {
      const ul = document.getElementById('myAssignments');
      ul.innerHTML = tasks.length ? '' : '<li>No assignments yet.</li>';
      tasks.forEach(t => {
        const li = document.createElement('li');
        li.textContent = `${t.task}`;
        const btn = document.createElement('button');
        btn.textContent = 'Submit';
        btn.className = 'btn btn-sm btn-success ms-2';
        btn.onclick = () => submitAssignment(t._id);
        li.appendChild(btn);
        ul.appendChild(li);
      });
    });
}

function logHelp(e) {
  e.preventDefault();
  const to_user = document.getElementById('toUserId').value;
  const task = document.getElementById('helpTask').value;
  const hours = document.getElementById('helpHours').value;
  fetch(`${api}/help/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from_user: userId, to_user, task, hours })
  }).then(() => location.reload());
}

function requestHelp(e) {
  e.preventDefault();
  const task = document.getElementById('requestTask').value;
  const credits_used = document.getElementById('requestCredits').value;
  fetch(`${api}/request/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ by_user: userId, task, credits_used })
  }).then(() => location.reload());
}

function submitAssignment(id) {
  fetch(`${api}/assignment/submit/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student: userId })
  }).then(() => {
    alert('Assignment submitted!');
    loadAssignments();
  });
}

function handleApproval(id, action) {
  fetch(`${api}/help/approve/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId,action })
  }).then(() => location.reload());
}

function fulfillRequest(id) {
  fetch(`${api}/request/fulfill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: userId, fulfillerId: userId })
  }).then(() => location.reload());
}
function submitStudentLeave(e) {
  e.preventDefault();

  const reason = document.getElementById('studentLeaveReason').value.trim();
  const type = document.getElementById('studentLeaveType').value;
  const fromDate = document.getElementById('studentFromDate').value;
  const toDate = document.getElementById('studentToDate').value;

  fetch(`${api}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,  // make sure `studentId` is set from URL or session
      reason,
      type,
      fromDate,
      toDate
    })
  })
    .then(r => r.json())
    .then(() => {
      alert('Leave request submitted!');
      document.getElementById('studentLeaveForm').reset();
      loadStudentLeaves();
    })
    .catch(err => {
      console.error(err);
      alert('Failed to submit leave: ' + err.message);
    });
}

function loadStudentLeaves() {
  fetch(`${api}/leave?userId=${userId}`)
    .then(r => r.json())
    .then(leaves => {
      const ul = document.getElementById('studentMyLeaves');
      ul.innerHTML = '';
      if (!leaves.length) {
        ul.innerHTML = `<li class="list-group-item">No leaves yet.</li>`;
        return;
      }

      leaves.forEach(l => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const statusClass =
          l.status === 'Approved' ? 'bg-success text-white' :
          l.status === 'Rejected' ? 'bg-danger text-white' :
          'bg-secondary text-white';

        li.innerHTML = `
          <div>
            <strong>${l.type}</strong> leave 
            (${new Date(l.fromDate).toLocaleDateString()} → ${new Date(l.toDate).toLocaleDateString()}): 
            ${l.reason}
          </div>
          <span class="badge ${statusClass}">${l.status}</span>
        `;
        ul.appendChild(li);
      });
    });
}