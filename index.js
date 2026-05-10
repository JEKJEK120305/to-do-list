window.addEventListener("load", ()=> {

    let tasks = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
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

    const save = () => localStorage.setItem('tasks_v2', JSON.stringify(tasks));
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

    function dlStatus(dl) {
        if (!dl) return null;
        if (dl < TODAY) return 'overdue';
        if (dl === TODAY) return 'today';
        const diff = Math.round((new Date(dl) - new Date(TODAY)) / 86400000);
        return diff <= 3 ? 'soon' : 'future';
    }

    function dlLabel(dl) {
        if (!dl) return '';
        const s = dlStatus(dl);
        const d = new Date(dl + 'T00:00:00');
        const fmt = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
        if (s === 'overdue') return `Overdue · ${fmt}`;
        if (s === 'today') return 'Due today';
        const diff = Math.round((new Date(dl) - new Date(TODAY)) / 86400000);

        if (diff === 1) return 'Tomorrow';
        if (diff <= 3) return `In ${diff} days · ${fmt}`;
        return fmt;
    }

    function updateMeta() {
        const active = tasks.filter(t => !t.done).length;
        const total = tasks.length;
        const done = tasks.filter(t => t.done).length;
        const overdue = tasks.filter(t => !t.done && t.deadline && t.deadline < TODAY).length;

        activeCount.textContent = `${active} left`;
        let info = total ? `${done} of ${total} completed` : '';

        if (overdue) info += (info ? ' · ' : '') + `${overdue} overdue`;
        footerInfo.textContent = info;
        clearComplete.style.display = done ? 'block' : 'none';
    }

    function esc(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    const iconEdit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    const iconDelete = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

    function render() {
        let visible = tasks.filter(t => 
            filter === 'all' ? true :
            filter === 'active' ? !t.done :
            filter === 'overdue' ? (!t.done && t.deadline && t.deadline < TODAY) : 
            t.done
        );
        list.innerHTML = '';

        if (!visible.length) {
            const msgs = {
                all: ['All Clear!', 'Add a task to get started.'], active: ['All done!', 'No pending tasks.'], overdue: ['No Overdue Task!', 'Good Job!'], done: ['Nothing done yet.', 'Complete a task.'],
            };

            const [big, small] = msgs[filter];
            list.innerHTML = `<div class="empty-task"><span class="big">${big}</span><small>${small}</small></div>`;
            updateMeta(); 
            return;
        }

        visible.forEach(task => {
            const status = dlStatus(task.deadline);
            const li = document.createElement('li');
            li.className = `task-item${task.done ? ' done' : ''}${status ? ' dl-' + status : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
            <div class="check-flex">
                <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''}>
                <div class="task-body">
                    <span class="task-text">${esc(task.text)}</span>
                    ⋅ ${task.deadline ? `<span class="task-dl">${dlLabel(task.deadline)}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="icon-btn edit" title="Edit">${iconEdit}</button>
                    <button class="icon-btn delete" title="Delete">${iconDelete}</button>
                </div>
            </div>
            `;

            li.querySelector('.task-check').addEventListener('change', e => { task.done = e.target.checked;
                save();
                render(); 
            });

            li.querySelector('.delete').addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id);
                save();
                render();
            });

            li.querySelector('.edit').addEventListener('click', () => {
                const textEl = li.querySelector('.task-text');
                const current = task.text;
                textEl.innerHTML = `<input class="edit-input" value="${esc(current)}" maxlength="200">`;
                const inp = textEl.querySelector('.edit-input');
                inp.focus();
                inp.select();
                    
                const commit = () => {
                    const newVal = inp.value.trim();
                    if (newVal && newVal !== current) {
                        task.text = newVal;
                        save();
                    }
                    render();
                };
                    
                inp.addEventListener('blur', commit);
                inp.addEventListener('keydown', e => {
                    if (e.key === 'Enter') commit();
                    if (e.key === 'Escape') render(); 
                    
                });
            });
                
            list.appendChild(li);
            
        });
            
        updateMeta();
        

    }


    function addTask() {
        const val = taskInput.value.trim();
        if (!val) {
            taskInput.classList.add('input-error');
            taskInput.focus(); 
            return; 
        }
        taskInput.classList.remove('input-error');

        taskInput.addEventListener('input', () => {
            taskInput.classList.remove('input-error');
        });

        tasks.unshift({
            id: uid(),
            text: val,
            deadline: deadlineInput.value || null,
            done: false,
            createdAt: Date.now()
        });
        taskInput.value = '';
        deadlineInput.value = '';
        save();
        render();
        taskInput.focus();
    }

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', e => {if (e.key === 'Enter') addTask(); });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filter = btn.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            render();
        });
    });

    clearComplete.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.done);
        save(); render();
    });

    render();

});