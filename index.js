window.addEventListener("load", ()=> {

    let task = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
    let filter = 'all';

    const taskInput = document.getElementById('input-task');
    const deadlineInput = document.getElementById('deadline-input');
    const addBtn = document.getElementById('task-btn');
    const list = document.getElementById('task-list');
    const activeCount = document.getElementById('active-task-count');
    const footerInfo = document.getElementById('footer-info');
    const clearComplete = document.getElementById('clear-completed');

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const NOW = new Date();

    function toDateStr(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const TODAY = toDateStr(NOW);

    document.getElementById('date-txt').textContent = `${DAYS[NOW.getDay()]} · ${MONTHS[NOW.getMonth()]} ${NOW.getDate()}, ${NOW.getFullYear()}`;
    deadlineInput.min = TODAY;

    const save = () => localStorage.setItem('tasks_v2', JSON,stringify(tasks));
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

    function dlStatus(dl) {
        if (!dl) return null;
        if (dl < TODAY) return 'overdue';
        if (dl === TODAY) return 'today';
        const diff = Math.round((new Date(dl) - new Date(TODAY)) / 86400000);
        return diff <= 3 ? 'soon' : 'future';
    }
});