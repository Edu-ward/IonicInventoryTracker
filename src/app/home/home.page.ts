import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonGrid, IonRow, IonCol, IonIcon, IonCard, IonLabel, IonCardContent, IonItem, IonCardHeader, IonTabs, IonTabBar, IonTabButton, IonTab, IonCardTitle, IonButtons, AlertController, ToastController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, addCircleOutline, listOutline, logOutOutline, searchOutline } from 'ionicons/icons';

addIcons({
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'add-circle-outline': addCircleOutline,
  'list-outline': listOutline,
  'log-out-outline': logOutOutline,
  'search-outline': searchOutline
});

interface Item {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [ IonButtons, IonCardTitle, IonTab, IonTabs, IonTabBar, IonTabButton, IonCardHeader, IonItem, IonCardContent, IonLabel, IonCard, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonGrid, IonRow, IonCol, FormsModule
  ],
})
export class HomePage {

  inventory: Item[] = [];
  filteredInventory: Item[] = [];
  lastId: number = 0;

  searchTerm = '';

  newName = '';
  newQuantity: number | null = null;
  newPrice: number | null = null;

  editingId: number | null = null;
  editName = '';
  editQuantity: number | null = null;
  editPrice: number | null = null;

  isLoggedIn = false;
  loginUsername = '';
  loginPassword = '';
  loginError = false;

  validUser = { username: "admin", password: "admin123" };

  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.loadFromStorage();
    this.filteredInventory = this.inventory;
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }

  loadFromStorage() {
    const data = localStorage.getItem('inventory');
    const idData = localStorage.getItem('inventory_last_id');
    if (data) this.inventory = JSON.parse(data);
    if (idData) this.lastId = Number(idData);
    this.filterList();
  }

  saveToStorage() {
    localStorage.setItem('inventory', JSON.stringify(this.inventory));
    localStorage.setItem('inventory_last_id', String(this.lastId));
    this.filterList();
  }

  filterList() {
    const term = this.searchTerm.toLowerCase();
    this.filteredInventory = this.inventory.filter(item =>
      item.name.toLowerCase().includes(term)
    );
  }

  async addItem() {
    if (!this.newName || this.newQuantity == null || this.newPrice == null) return;

    const existingItem = this.inventory.find(
      item => item.name.toLowerCase() === this.newName.toLowerCase()
    );

    if (existingItem) {
      existingItem.quantity += this.newQuantity!;
      existingItem.price = this.newPrice;
      await this.showToast('Existing item updated: quantity increased and price updated.', 'warning');
    } else {
      this.lastId++;
      this.inventory.push({
        id: this.lastId,
        name: this.newName,
        quantity: this.newQuantity,
        price: this.newPrice
      });
      await this.showToast('The item has been added to the inventory.');
    }

    this.newName = '';
    this.newQuantity = null;
    this.newPrice = null;

    this.saveToStorage();
  }

  async deleteItem(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.inventory = this.inventory.filter(i => i.id !== id);
            this.saveToStorage();
            this.showToast('Item deleted', 'danger');
          }
        }
      ]
    });
    await alert.present();
  }

  startEdit(item: Item) {
    this.editingId = item.id;
    this.editName = item.name;
    this.editQuantity = item.quantity;
    this.editPrice = item.price;
  }

  async saveEdit() {
    if (this.editingId != null && this.editName && this.editQuantity != null && this.editPrice != null) {
      const index = this.inventory.findIndex(i => i.id === this.editingId);
      if (index > -1) {
        this.inventory[index].name = this.editName;
        this.inventory[index].quantity = this.editQuantity;
        this.inventory[index].price = this.editPrice;
      }
      this.cancelEdit();
      this.saveToStorage();
      await this.showToast('Item updated');
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editName = '';
    this.editQuantity = null;
    this.editPrice = null;
  }

  async login() {
    if (this.loginUsername == this.validUser.username && this.loginPassword == this.validUser.password) {
      this.isLoggedIn = true;
      this.loginError = false;
      localStorage.setItem("logged_in", "true");
      await this.showToast('Login Successful');
    } else {
      this.loginError = true;
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.isLoggedIn = false;
            localStorage.removeItem("logged_in");
            this.showToast('Logged out', 'warning');
          }
        }
      ]
    });
    await alert.present();
  }
}
