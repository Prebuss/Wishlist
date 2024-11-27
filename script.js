// script.js

let family = {
    members: []
};

let loggedInUser = null;

// Load family data from localStorage, or create new data if none exists
function loadFamilyData() {
    const data = localStorage.getItem('family_data');
    if (data) {
        family = JSON.parse(data);
    } else {
        saveFamilyData(); // Create initial data if none exists
    }
}

// Save family data to localStorage
function saveFamilyData() {
    localStorage.setItem('family_data', JSON.stringify(family));
}

// Initial load of family data
loadFamilyData();

// Login Function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const member = family.members.find(member => member.name === username);
    if (member && member.password === password) {
        loggedInUser = member;
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('wishlistContainer').style.display = 'block';
        renderWishlists();
    } else {
        alert('Incorrect username or password!');
    }
}

// Create User Function
function createUser() {
    const newUsername = document.getElementById('newUserUsername').value;
    const newPassword = document.getElementById('newUserPassword').value;
    if (newUsername && newPassword) {
        const existingMember = family.members.find(member => member.name === newUsername);
        if (!existingMember) {
            addMember(newUsername, newPassword);
            alert('User created successfully! You can now log in.');
        } else {
            alert('Username already exists! Please choose a different username.');
        }
    } else {
        alert('Please enter both a username and password to create a user.');
    }
}

// Function to Add a New Member
function addMember(memberName, password) {
    family.members.push({
        name: memberName,
        password: password,
        wishlist: []
    });
    saveFamilyData();
}

// Function to Add an Item to a Member's Wishlist from Input
function addItemToWishlistFromInput(memberName) {
    const itemName = document.getElementById(`itemInput-${memberName}`).value;
    const itemVendor = document.getElementById(`vendorInput-${memberName}`).value;
    const itemPrice = document.getElementById(`priceInput-${memberName}`).value;
    const itemLink = document.getElementById(`linkInput-${memberName}`).value;
    const memberPassword = prompt('Enter password to add item:');

    const member = family.members.find(member => member.name === memberName);
    if (member && memberPassword === member.password) {
        if (itemName && itemVendor && itemPrice && itemLink) {
            addItemToWishlist(memberName, itemName, itemVendor, itemPrice, itemLink);
            document.getElementById(`itemInput-${memberName}`).value = '';
            document.getElementById(`vendorInput-${memberName}`).value = '';
            document.getElementById(`priceInput-${memberName}`).value = '';
            document.getElementById(`linkInput-${memberName}`).value = '';
            renderWishlists();
        }
    } else {
        alert('Incorrect password!');
    }
}

// Function to Add an Item to a Member's Wishlist
function addItemToWishlist(memberName, itemName, vendor, price, link) {
    const member = family.members.find(member => member.name === memberName);
    if (member) {
        member.wishlist.push({ item: itemName, vendor: vendor, price: price, link: link, boughtBy: null });
        saveFamilyData();
    }
}

// Function to Remove an Item from a Member's Wishlist
function removeItemFromWishlist(memberName, itemName) {
    const memberPassword = prompt('Enter password to remove item:');
    const member = family.members.find(member => member.name === memberName);
    if (member && memberPassword === member.password) {
        member.wishlist = member.wishlist.filter(item => item.item !== itemName);
        saveFamilyData();
        renderWishlists();
    } else {
        alert('Incorrect password!');
    }
}

// Function to Mark an Item as Bought by Another Member
function markItemAsBought(memberName, itemName, boughtByName) {
    const member = family.members.find(member => member.name === memberName);
    if (member) {
        const item = member.wishlist.find(item => item.item === itemName);
        if (item && item.boughtBy === null && member.name !== loggedInUser.name) {
            item.boughtBy = boughtByName;
            saveFamilyData();
            renderWishlists();
        }
    }
}

// Function to Render Wishlists
function renderWishlists() {
    const wishlists = document.getElementById('wishlists');
    wishlists.innerHTML = '';
    family.members.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        
        const memberTitle = document.createElement('h2');
        memberTitle.textContent = member.name;
        memberDiv.appendChild(memberTitle);

        const itemInput = document.createElement('input');
        itemInput.type = 'text';
        itemInput.id = `itemInput-${member.name}`;
        itemInput.placeholder = 'Enter item name';
        memberDiv.appendChild(itemInput);

        const vendorInput = document.createElement('input');
        vendorInput.type = 'text';
        vendorInput.id = `vendorInput-${member.name}`;
        vendorInput.placeholder = 'Enter vendor';
        memberDiv.appendChild(vendorInput);

        const priceInput = document.createElement('input');
        priceInput.type = 'text';
        priceInput.id = `priceInput-${member.name}`;
        priceInput.placeholder = 'Enter price';
        memberDiv.appendChild(priceInput);

        const linkInput = document.createElement('input');
        linkInput.type = 'text';
        linkInput.id = `linkInput-${member.name}`;
        linkInput.placeholder = 'Enter hyperlink';
        memberDiv.appendChild(linkInput);

        const addItemButton = document.createElement('button');
        addItemButton.textContent = 'Add Item';
        addItemButton.onclick = () => addItemToWishlistFromInput(member.name);
        memberDiv.appendChild(addItemButton);

        const wishlistTable = document.createElement('table');
        wishlistTable.className = 'wishlist-table';
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th>Item</th><th>Vendor</th><th>Price</th><th>Link</th><th>Actions</th>`;
        wishlistTable.appendChild(headerRow);

        member.wishlist.forEach(item => {
            const wishlistRow = document.createElement('tr');
            wishlistRow.innerHTML = `<td>${item.item}</td><td>${item.vendor}</td><td>${item.price}</td><td><a href="${item.link}" target="_blank">Link</a></td>`;
            const actionsCell = document.createElement('td');

            if (item.boughtBy && loggedInUser.name !== member.name) {
                actionsCell.textContent = `Bought by: ${item.boughtBy}`;
            } else if (!item.boughtBy) {
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Mark as Bought';
                buyButton.onclick = () => {
                    const buyer = prompt('Enter your name to mark this item as bought:');
                    if (buyer) {
                        markItemAsBought(member.name, item.item, buyer);
                    }
                };
                actionsCell.appendChild(buyButton);
            }

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => removeItemFromWishlist(member.name, item.item);
            actionsCell.appendChild(removeButton);

            wishlistRow.appendChild(actionsCell);
            wishlistTable.appendChild(wishlistRow);
        });
        memberDiv.appendChild(wishlistTable);

        wishlists.appendChild(memberDiv);
    });
}

// Initial Render (login required first)
// renderWishlists();
