/* =============================================
   LAMIM — FINANCE MODULE (Zakat & Wealth)
   ============================================= */
const Finance = {
  init() {
    this.renderZakat();
    this.renderDebts();
  },

  renderZakat() {
    const data = DB.getFinance();
    const container = document.getElementById('finance-zakat');
    if (!container) return;

    const totalWealth = (data.cash || 0) + (data.gold || 0) + (data.silver || 0) + (data.business || 0) + (data.stocks || 0);
    const isEligible = totalWealth >= data.nisab;
    const zakatOwed = isEligible ? (totalWealth * 0.025) : 0;

    container.innerHTML = `
      <div class="card mb-4" style="background:var(--gradient-hero)">
        <div class="flex justify-between items-center mb-4">
          <div>
            <div class="text-sm text-muted">Current Nisab Threshold</div>
            <div class="text-xl font-bold">$${data.nisab}</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="Finance.updateNisab()">Update Nisab</button>
        </div>
        <div class="divider"></div>
        <div class="flex justify-between items-center mb-2">
          <div class="text-sm text-muted">Total Zakatable Wealth</div>
          <div class="text-lg font-bold">$${totalWealth.toFixed(2)}</div>
        </div>
        <div class="flex justify-between items-center">
          <div class="text-sm text-muted">Zakat Owed (2.5%)</div>
          <div class="text-2xl font-bold" style="color:var(--color-accent-gold)">$${zakatOwed.toFixed(2)}</div>
        </div>
        ${!isEligible ? '<div class="mt-3 text-xs text-amber">Wealth is below Nisab. Zakat is not obligatory.</div>' : ''}
      </div>

      <div class="card mb-4">
        <div class="card-header"><div class="card-title">Wealth Breakdown</div></div>
        <div class="grid-2">
          <div class="input-group">
            <label class="input-label">Cash & Bank</label>
            <div class="input-wrapper"><span class="input-icon">$</span><input type="number" class="input input-with-icon" value="${data.cash}" onchange="Finance.updateWealth('cash', this.value)"></div>
          </div>
          <div class="input-group">
            <label class="input-label">Gold Value</label>
            <div class="input-wrapper"><span class="input-icon">$</span><input type="number" class="input input-with-icon" value="${data.gold}" onchange="Finance.updateWealth('gold', this.value)"></div>
          </div>
          <div class="input-group">
            <label class="input-label">Silver Value</label>
            <div class="input-wrapper"><span class="input-icon">$</span><input type="number" class="input input-with-icon" value="${data.silver}" onchange="Finance.updateWealth('silver', this.value)"></div>
          </div>
          <div class="input-group">
            <label class="input-label">Business/Stocks</label>
            <div class="input-wrapper"><span class="input-icon">$</span><input type="number" class="input input-with-icon" value="${data.stocks}" onchange="Finance.updateWealth('stocks', this.value)"></div>
          </div>
        </div>
      </div>
    `;
  },

  updateNisab() {
    const data = DB.getFinance();
    const val = prompt('Enter the current Nisab value (in your currency):', data.nisab);
    if (val && !isNaN(val)) {
      data.nisab = parseFloat(val);
      DB.setFinance(data);
      this.renderZakat();
    }
  },

  updateWealth(key, val) {
    const data = DB.getFinance();
    data[key] = parseFloat(val) || 0;
    DB.setFinance(data);
    this.renderZakat();
  },

  renderDebts() {
    const data = DB.getFinance();
    const container = document.getElementById('finance-debts');
    if (!container) return;

    if (!data.debts || data.debts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No debts tracked</p>
          <button class="btn btn-sm btn-gold mt-3" onclick="Finance.addDebt()">Add Debt</button>
        </div>
      `;
      return;
    }

    let totalDebt = data.debts.reduce((a, b) => a + b.amount, 0);

    container.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <div class="text-sm">Total Debt: <strong class="text-red">$${totalDebt.toFixed(2)}</strong></div>
        <button class="btn btn-sm btn-gold" onclick="Finance.addDebt()">+ Add</button>
      </div>
      <div class="flex-col gap-3">
        ${data.debts.map(d => `
          <div class="card card-sm flex justify-between items-center hover-lift">
            <div>
              <div class="font-bold">${d.name}</div>
              <div class="text-xs text-muted">Amount: $${d.amount}</div>
            </div>
            <button class="btn btn-sm btn-danger" onclick="Finance.removeDebt('${d.id}')">Paid</button>
          </div>
        `).join('')}
      </div>
    `;
  },

  addDebt() {
    const name = prompt('Who/what is this debt for?');
    if (!name) return;
    const amount = prompt('Amount:');
    if (!amount || isNaN(amount)) return;

    const data = DB.getFinance();
    if (!data.debts) data.debts = [];
    data.debts.push({ id: Utils.uid(), name, amount: parseFloat(amount) });
    DB.setFinance(data);
    this.renderDebts();
    Utils.toast('Debt added', 'info');
  },

  removeDebt(id) {
    if(!confirm('Mark this debt as paid?')) return;
    const data = DB.getFinance();
    data.debts = data.debts.filter(d => d.id !== id);
    DB.setFinance(data);
    this.renderDebts();
    Utils.toast('Alhamdulillah, debt cleared!', 'success');
  }
};
