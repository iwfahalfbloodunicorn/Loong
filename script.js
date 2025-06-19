const input = document.getElementById('textInput');
const button = document.getElementById('sendBtn');
const list = document.getElementById('itemList');
const status = document.getElementById('statusText');

let itemCount = 0;
let lastAction = null;

function createItem(text) {
  itemCount++;

  const li = document.createElement('li');
  li.className = 'menu-item';

  // 加序号和内容
  const labelSpan = document.createElement('span');
  labelSpan.textContent = `${itemCount}. ${text}`;

  // 删除按钮
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.textContent = '❌';
  // delBtn.onclick = (e) => {
  //   e.stopPropagation();
  
  //   // 记录删除前的位置信息
  //   const siblings = Array.from(list.children);
  //   const index = siblings.indexOf(li);
  
  //   // 记录撤销操作
  //   lastAction = {
  //     type: 'delete',
  //     item: li,
  //     text: text,
  //     index: index
  //   };
  
  //   // 删除该项
  //   list.removeChild(li);
  //   renumberItems();
  //   status.textContent = `已删除「${text}」`;
  // };
  
  

  li.appendChild(labelSpan);
  li.appendChild(delBtn);

  // li.onclick = () => {
  //   document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('selected'));
  //   li.classList.add('selected');
  //   status.textContent = `你选中了「${text}」`;
  // };

  list.appendChild(li);
}

function renumberItems() {
  const items = Array.from(list.querySelectorAll('.menu-item')).reverse();
  itemCount = items.length;
  items.forEach((item, index) => {
    const label = item.querySelector('span');
    const textContent = label.textContent.split('. ')[1];
    label.textContent = `${itemCount - index}. ${textContent}`;
  });
}


button.addEventListener('click', () => {
  const value = input.value.trim();
  if (!value) {
    status.textContent = '输入不能为空';
    return;
  }

  const items = Array.from(list.querySelectorAll('.menu-item span'));
  const exactMatch = items.find(item => item.textContent.split('. ')[1] === value);

  if (exactMatch) {
    const parentLi = exactMatch.parentElement;
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('selected'));
    // parentLi.classList.add('selected');

    const label = exactMatch.textContent;
    const index = label.split('. ')[0];
    status.textContent = `「${value}」已存在（序号 ${index}）`;
    return;
  }

  // ✅ 没有完全重复，添加新项
  const newItem = createItem(value);
  input.value = '';
  status.textContent = `已添加「${value}」`;

  // 🔍 检查所有相似项，分别提示
  const newText = value;
  let matchFound = false;

  items.forEach((item) => {
    const existingText = item.textContent.split('. ')[1];
    if (existingText.length !== newText.length) {
      return; // 长度不同直接跳过
    }

    const common = countCommonChars(existingText, newText);
    const threshold = Math.floor(Math.min(existingText.length, newText.length) * 0.6);

    if (common >= threshold) {
      matchFound = true;

      const oldItem = item.parentElement;
      oldItem.classList.add('selected');
      newItem.classList.add('selected');

      showDuplicateWarning(existingText, newText, newItem, oldItem);
    }
  });
});


function createItem(text) {
  const li = document.createElement('li');
  li.className = 'menu-item';

  // 为这个项目生成唯一 ID，方便后续识别
  const uniqueId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  li.dataset.id = uniqueId;

  // 内容 + 序号
  const labelSpan = document.createElement('span');
  labelSpan.textContent = `${++itemCount}. ${text}`;

  // 删除按钮
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.textContent = '❌';
  delBtn.onclick = (e) => {
    e.stopPropagation();
  
    // 记录删除前的位置信息
    const siblings = Array.from(list.children);
    const index = siblings.indexOf(li);
  
    // 记录撤销操作
    lastAction = {
      type: 'delete',
      item: li,
      text: text,
      index: index
    };
  
    // 删除该项
    list.removeChild(li);
    renumberItems();
    status.textContent = `已删除「${text}」`;
  };

  // 点击选中（高亮）
  li.onclick = () => {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('selected'));
    li.classList.add('selected');
    status.textContent = `你选中了「${text}」`;
  };

  li.appendChild(labelSpan);
  li.appendChild(delBtn);

  // 插入到列表最上方（倒序）
  list.insertBefore(li, list.firstChild);
  lastAction = { type: 'add', item: li, text: text };
  return li;
}


function showDuplicateWarning(oldText, newText, newItemRef, oldItemRef) {
  const container = document.getElementById('duplicateWarningContainer');
  const box = document.createElement('div');
  box.className = 'duplicate-warning';
  const newId = newItemRef.dataset.id || `item-${Date.now()}`;
  newItemRef.dataset.id = newId;
  box.dataset.related = newId;

  box.innerHTML = `
    <div>「${newText}」可能与「${oldText}」重复。</div>
    <div class="actions">
      <button class="confirm">✅</button>
      <button class="cancel">❌</button>
    </div>
  `;

  box.querySelector('.confirm').onclick = () => {
    // ✅ 删除新项目
    list.removeChild(newItemRef);
    renumberItems();

    // 🧼 清除所有与此新项相关的提示框和高亮
    document.querySelectorAll(`.duplicate-warning[data-related="${newId}"]`).forEach(warning => warning.remove());
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('selected'));

    status.textContent = `已删除新添加的重复项「${newText}」`;
  };

  box.querySelector('.cancel').onclick = () => {
    // ❌ 仅关闭当前提示 + 清除当前高亮
    newItemRef.classList.remove('selected');
    oldItemRef.classList.remove('selected');
    box.remove();
  };

  container.appendChild(box);
}






input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') button.click();
});

function countCommonChars(a, b) {
  const setB = new Set(b);
  return [...a].filter(char => setB.has(char)).length;
}

const importBtn = document.getElementById('importBtn');
const bulkInput = document.getElementById('bulkInput');

importBtn.addEventListener('click', () => {
  const lines = bulkInput.value.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    status.textContent = '导入内容为空';
    return;
  }

  lines.forEach(text => {
    createItem(text); // ✅ 不进行重复检查
  });

  status.textContent = `已导入 ${lines.length} 项内容`;
  bulkInput.value = '';
});

const undoBtn = document.getElementById('undoBtn');
undoBtn.addEventListener('click', () => {
  if (!lastAction) {
    status.textContent = '没有可以撤销的操作';
    return;
  }

  if (lastAction.type === 'add') {
    list.removeChild(lastAction.item);
    renumberItems();
    status.textContent = `已撤销添加「${lastAction.text}」`;
  }

  if (lastAction.type === 'delete') {
    const siblings = Array.from(list.children);
    const insertBeforeNode = siblings[lastAction.index] || null; // 插回原位置（或末尾）
    list.insertBefore(lastAction.item, insertBeforeNode);
    renumberItems();
    status.textContent = `已撤销删除「${lastAction.text}」`;
  }

  lastAction = null;
});

const exportBtn = document.getElementById('exportBtn');

exportBtn.addEventListener('click', () => {
  const items = Array.from(document.querySelectorAll('.menu-item span')).reverse(); // 正序导出
  const lines = items.map(item => {
    const text = item.textContent.split('. ')[1]; // 去掉序号
    return text;
  });

  bulkInput.value = lines.join('\n');
  status.textContent = `已导出 ${lines.length} 项内容`;
});
