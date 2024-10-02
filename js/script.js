document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-bar');
    const editButton = document.querySelector('.btn.edit');
    const deleteButton = document.querySelector('.btn.delete');
    let selectedRows = [];
    let originalData = []; 

    
    fetch('./data/data.json')
        .then(response => response.json())
        .then(data => {
            originalData = data; 
            populateTable(data);
        })
        .catch(error => console.error('Error loading JSON:', error));

    
    function populateTable(data) {
        tableBody.innerHTML = ''; 
        data.forEach((item) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', item.id); 

            row.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-id="${item.id}"></td>
                <td>${item.id}</td>
                <td class="editable" data-field="name">${item.name}</td>
                <td class="editable" data-field="email">${item.email}</td>
                <td class="editable" data-field="date">${item.date}</td>
                <td>${item.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</td>
                <td><button class="save-btn" style="display:none;">Save</button></td>
                <td><button class="cancel-btn" style="display:none;">Cancel</button></td>
            `;
            tableBody.appendChild(row);
        });

        
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleRowSelection);
        });
    }

    
    function handleRowSelection(event) {
        const checkbox = event.target;
        const rowId = checkbox.dataset.id;
        const row = document.querySelector(`tr[data-id="${rowId}"]`);

        if (checkbox.checked) {
            selectedRows.push(rowId);
            enableRowEditing(row);
        } else {
            selectedRows = selectedRows.filter(id => id !== rowId);
            disableRowEditing(row);
        }

        toggleActionButtons();
    }

    
    function enableRowEditing(row) {
        const editableFields = row.querySelectorAll('.editable');
        editableFields.forEach(cell => {
            const originalValue = cell.textContent;
            const field = cell.dataset.field;
            cell.innerHTML = `<input type="text" value="${originalValue}" class="edit-input" data-field="${field}">`;
        });

        row.querySelector('.save-btn').style.display = 'inline';
        row.querySelector('.cancel-btn').style.display = 'inline';
    }

    
    function disableRowEditing(row) {
        const editableFields = row.querySelectorAll('.editable');
        editableFields.forEach(cell => {
            const input = cell.querySelector('input');
            if (input) {
                const originalValue = input.value;
                cell.innerHTML = originalValue; 
            }
        });

        row.querySelector('.save-btn').style.display = 'none';
        row.querySelector('.cancel-btn').style.display = 'none';
    }

    
    function toggleActionButtons() {
        if (selectedRows.length === 1) {
            editButton.disabled = false; 
        } else {
            editButton.disabled = true; 
        }

        deleteButton.disabled = selectedRows.length === 0; 
    }

    
    tableBody.addEventListener('click', function (event) {
        if (event.target.classList.contains('save-btn')) {
            const row = event.target.closest('tr');
            const inputs = row.querySelectorAll('.edit-input');
            let updatedData = {};
            
            inputs.forEach(input => {
                const field = input.dataset.field;
                updatedData[field] = input.value; 
            });
            
            
            console.log('Updated data:', updatedData);

            disableRowEditing(row); 
        }
    });

    
    tableBody.addEventListener('click', function (event) {
        if (event.target.classList.contains('cancel-btn')) {
            const row = event.target.closest('tr');
            disableRowEditing(row); 
        }
    });

    
    editButton.addEventListener('click', () => {
        if (selectedRows.length === 1) {
            const selectedRowId = selectedRows[0];
            const selectedRow = document.querySelector(`tr[data-id="${selectedRowId}"]`);
            enableRowEditing(selectedRow);
        }
    });

    
    deleteButton.addEventListener('click', () => {
        if (selectedRows.length > 0) {
            const newData = originalData.filter(item => !selectedRows.includes(item.id.toString()));
            populateTable(newData); 
            originalData = newData; 
            selectedRows = []; 
            toggleActionButtons(); 
            
            
            updateDataOnServer(newData);
        } else {
            alert('Please select at least one row to delete.');
        }
    });

    
   
searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredData = originalData.filter(item => {
        return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm) ||
            item.date.toLowerCase().includes(searchTerm) ||
            item.id.toString().includes(searchTerm) 
        );
    });
    populateTable(filteredData);

    });
});


function updateDataOnServer(newData) {
    fetch('/update-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Data updated on server:', result);
    })
    .catch(error => {
        console.error('Error updating data on server:', error);
    });
}
