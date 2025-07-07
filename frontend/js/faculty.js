const api = `http://localhost:3000/api`;
const urlParams = new URLSearchParams(window.location.search);
const facultyId = urlParams.get('userId');

if (!facultyId) alert("Faculty ID missing in URL");

let facultyDepartment = ''; // TODO: Make dynamic if required

document.addEventListener('DOMContentLoaded', async () => {
  await fetchFacultyProfile();  // ⬅️ wait until facultyDepartment is set
  loadNotices();
  loadStudents();
  loadSubmittedAssignments();
  loadLeaves();
  document.getElementById('leaveForm').addEventListener('submit', submitLeave);
});

async function fetchFacultyProfile() {
  const res = await fetch(`${api}/user/${facultyId}`);
  const data = await res.json();
  facultyDepartment = data.department || '';
  document.getElementById('myName').textContent = data.name;
  document.getElementById('myDepartment').textContent = facultyDepartment;
}
function loadNotices() {
  const params = new URLSearchParams({ role: 'faculty', department: facultyDepartment });
  fetch(`${api}/notices?${params}`)
    .then(res => res.json())
    .then(notices => {
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
          <td>${new Date(n.validTill).toLocaleDateString()}</td>
        `;
      });
    });
}

function loadStudents() {
  fetch(`${api}/faculty/students?department=${facultyDepartment}`)
    .then(res => res.json())
    .then(students => {
      const container = document.getElementById('studentsList');
      container.innerHTML = '';
      students.forEach(s => {
        const div = document.createElement('div');
        div.className = 'card p-2 mb-2';
        div.innerHTML = `
          <strong>${s.name}</strong> (${s.email})
          <button class="btn btn-sm btn-primary ms-2" onclick="markAttendance('${s._id}')">Mark Attendance</button>
          <button class="btn btn-sm btn-success ms-2" onclick="assignTask('${s._id}')">Assign Task</button>
        `;
        container.appendChild(div);
      });
    });
}

function loadSubmittedAssignments() {
  fetch(`${api}/faculty/assignment/submitted/${facultyId}`)
    .then(res => res.json())
    .then(assignments => {
      const ul = document.getElementById('submittedAssignments');
      ul.innerHTML = '';
      if (!assignments.length) {
        ul.textContent = 'No submitted assignments yet.';
      } else {
        assignments.forEach(a => {
          const li = document.createElement('li');
          li.textContent = `${a.student.name} submitted: ${a.task}`;
          ul.appendChild(li);
        });
      }
    });
}

function markAttendance(studentId) {
  const subject = prompt("Enter subject:");
  const status = prompt("Enter status (present/absent):");
  if (!subject || !status) return;

  fetch(`${api}/faculty/attendance/mark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student: studentId,
      faculty: facultyId,
      subject,
      status,
      date: new Date()
    })
  }).then(() => alert('Attendance marked!'));
}

function assignTask(studentId) {
  const task = prompt("Enter task:");
  if (!task) return;

  fetch(`${api}/faculty/assignment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student: studentId,
      faculty: facultyId,
      task
    })
  }).then(() => alert('Assignment assigned!'));
}



function submitLeave(e) {
  e.preventDefault();
  const reason = document.getElementById('leaveReason').value;
  const type = document.getElementById('leaveType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;

  fetch(`${api}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId:facultyId,
      reason,
      type,
      fromDate,
      toDate
    })
  })
  .then(r => r.json())
  .then(() => {
    alert('Leave submitted!');
    loadLeaves();
  });
}

function loadLeaves() {
  fetch(`${api}/leave?userId=${facultyId}`)
    .then(r => r.json())
    .then(leaves => {
      const ul = document.getElementById('myLeaves');
      ul.innerHTML = '';
      if (!leaves.length) {
        ul.textContent = 'No leaves yet.';
        return;
      }
      leaves.forEach(l => {
        const li = document.createElement('li');
        li.textContent = `${l.type} leave (${l.fromDate} → ${l.toDate}): ${l.reason} [${l.status}]`;
        ul.appendChild(li);
      });
    });
}
