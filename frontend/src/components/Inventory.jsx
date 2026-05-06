import React, { useState, useEffect } from 'react';
import { Coffee, Droplets, Shirt, Apple, Sparkles, ChevronLeft, Plus, Minus, ShoppingCart, Trash2, Box } from 'lucide-react';

const DOMAINS = [
  { id: 'Kitchen', icon: Coffee, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { id: 'Bathroom', icon: Droplets, color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' },
  { id: 'Laundry', icon: Shirt, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  { id: 'Pantry', icon: Apple, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 'Cleaning', icon: Sparkles, color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },
  { id: 'Other', icon: Box, color: '#64748b', gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' },
];

export default function Inventory({ activeHouseholdId, baseUrl, user, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'units', minQuantity: 1 });

  useEffect(() => {
    fetchInventory();
  }, [activeHouseholdId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/inventory/household/${activeHouseholdId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    const itemToSave = { 
      ...newItem, 
      householdId: activeHouseholdId, 
      category: selectedDomain 
    };

    try {
      const res = await fetch(`${baseUrl}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemToSave)
      });
      if (res.ok) {
        const savedItem = await res.json();
        setItems([...items, savedItem]);
        setShowAddForm(false);
        setNewItem({ name: '', quantity: 1, unit: 'units', minQuantity: 1 });
        showToast(`Added ${savedItem.name}`, 'success');
      }
    } catch (err) {
      console.error("Add failed", err);
    }
  };

  const updateQuantity = async (item, delta) => {
    const newQty = Math.max(0, item.quantity + delta);
    const updatedItem = { ...item, quantity: newQty };
    
    try {
      const res = await fetch(`${baseUrl}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      if (res.ok) {
        setItems(items.map(i => i.id === item.id ? updatedItem : i));
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const res = await fetch(`${baseUrl}/inventory/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(i => i.id !== itemId));
        showToast("Item removed", 'info');
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const addToShoppingList = async (item) => {
    try {
      await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Buy ${item.name}`,
          description: `Automatically created from Inventory (${item.quantity} ${item.unit} left)`,
          householdId: activeHouseholdId,
          status: 'OPEN',
          severity: 'MEDIUM',
          assigneeId: user.id
        })
      });
      showToast(`Task "Buy ${item.name}" added!`, 'success');
    } catch (err) {
      showToast("Failed to add task", "error");
    }
  };

  if (loading) return <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading Inventory...</div>;

  const filteredItems = items.filter(i => i.category === selectedDomain);

  return (
    <div className="inventory-container animate-fade-in" style={{ perspective: '1000px', minHeight: '600px' }}>
      {!selectedDomain ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {DOMAINS.map(domain => {
            const count = items.filter(i => i.category === domain.id).length;
            const lowCount = items.filter(i => i.category === domain.id && i.quantity <= i.minQuantity).length;
            
            return (
              <div 
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  height: '200px',
                  borderRadius: '24px',
                  background: domain.gradient,
                  color: 'white',
                  padding: '24px',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-10px) rotateX(10deg) rotateY(5deg) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <domain.icon size={44} style={{ opacity: 0.9, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                  {lowCount > 0 && (
                    <div style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '99px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)', transform: 'translateZ(20px)' }}>
                      {lowCount} LOW
                    </div>
                  )}
                </div>
                <div style={{ transform: 'translateZ(30px)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{domain.id}</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', fontWeight: 500 }}>{count} Items tracked</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="detail-view animate-fade-in" style={{ transformStyle: 'preserve-3d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <button 
              onClick={() => setSelectedDomain(null)}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'rgba(255,255,255,0.8)', padding: '10px 20px', borderRadius: '16px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <ChevronLeft size={20} /> Back
            </button>
            <h2 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 800, background: DOMAINS.find(d => d.id === selectedDomain).gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {selectedDomain}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filteredItems.map(item => {
              const isLow = item.quantity <= item.minQuantity;
              const domainInfo = DOMAINS.find(d => d.id === selectedDomain);
              
              return (
                <div 
                  key={item.id}
                  style={{
                    padding: '24px',
                    borderRadius: '24px',
                    border: isLow ? `2px solid ${domainInfo.color}44` : '1px solid var(--glass-border)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isLow ? `0 12px 32px ${domainInfo.color}15` : 'var(--glass-shadow)',
                    background: 'rgba(255,255,255,0.9)',
                    transformStyle: 'preserve-3d'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateZ(10px) scale(1.01)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ transform: 'translateZ(20px)' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 700 }}>{item.name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Refill at: {item.minQuantity} {item.unit}</p>
                    </div>
                    <button 
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '10px 20px', borderRadius: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                      <button onClick={() => updateQuantity(item, -1)} style={{ background: 'white', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '6px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, minWidth: '45px', textAlign: 'center', color: isLow ? '#ef4444' : 'var(--text-main)' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item, 1)} style={{ background: 'white', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '6px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.unit}</span>
                  </div>

                  <button 
                    onClick={() => addToShoppingList(item)}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px', 
                      padding: '14px', 
                      borderRadius: '16px', 
                      background: isLow ? domainInfo.color : 'rgba(0,0,0,0.05)', 
                      color: isLow ? 'white' : 'var(--text-main)',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: '0.3s',
                      boxShadow: isLow ? `0 8px 20px ${domainInfo.color}44` : 'none'
                    }}
                    onMouseEnter={e => { if(isLow) e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { if(isLow) e.currentTarget.style.transform = 'none' }}
                  >
                    <ShoppingCart size={20} /> {isLow ? 'Restock Required' : 'Add to Shopping List'}
                  </button>
                </div>
              );
            })}
            
            {showAddForm ? (
              <form 
                onSubmit={handleAddItem}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderRadius: '24px',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                }}
              >
                <h4 style={{ margin: 0, fontWeight: 700 }}>New Tracked Item</h4>
                <input 
                  autoFocus
                  placeholder="Item Name (e.g. Milk)"
                  className="input-field"
                  style={{ margin: 0 }}
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number"
                    placeholder="Qty"
                    className="input-field"
                    style={{ margin: 0, flex: 1 }}
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  />
                  <input 
                    placeholder="Unit"
                    className="input-field"
                    style={{ margin: 0, flex: 2 }}
                    value={newItem.unit}
                    onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notify when below:</div>
                <input 
                  type="number"
                  placeholder="Min Quantity"
                  className="input-field"
                  style={{ margin: 0 }}
                  value={newItem.minQuantity}
                  onChange={e => setNewItem({ ...newItem, minQuantity: parseInt(e.target.value) || 0 })}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                  <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div 
                onClick={() => setShowAddForm(true)}
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '24px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: '0.3s',
                  background: 'rgba(255,255,255,0.4)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = DOMAINS.find(d => d.id === selectedDomain).color;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                  e.currentTarget.style.color = DOMAINS.find(d => d.id === selectedDomain).color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={32} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Track New Item</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
