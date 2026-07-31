import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MemberModal from '../components/MemberModal';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // null = Add, object = Edit

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // QR download loading per member
  const [qrLoading, setQrLoading] = useState({});

  // Fetch all members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/members');
      setMembers(res.data);
    } catch (err) {
      setError('Failed to load members. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Open Add modal
  const openAdd = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  // Open Edit modal
  const openEdit = (member) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  // Save — called by MemberModal with FormData
  const handleSave = async (formData) => {
    if (editingMember) {
      // Edit existing
      await api.put(`/api/members/${editingMember.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      // Add new
      await api.post('/api/members', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    await fetchMembers();
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/members/${deleteTarget.id}`);
      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert('Failed to delete member. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Download QR code as PNG
  const downloadQR = async (member) => {
    setQrLoading((prev) => ({ ...prev, [member.id]: true }));
    try {
      const res = await api.get(`/api/qr/${member.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${member.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate QR code.');
    } finally {
      setQrLoading((prev) => ({ ...prev, [member.id]: false }));
    }
  };

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.logoRing}>
            <span className={styles.logoText}>IEEE</span>
          </div>
          <div>
            <h1 className={styles.brandTitle}>Admin Dashboard</h1>
            <p className={styles.brandSub}>IEEE SB CECTL · ID Card System</p>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <button className={styles.addBtn} onClick={openAdd}>
            + Add Member
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{members.length}</span>
            <span className={styles.statLabel}>Total Members</span>
          </div>
        </div>

        {/* Error */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Loading skeleton */}
        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className={styles.empty}>
            <p>No members yet.</p>
            <button className={styles.addBtnInline} onClick={openAdd}>Add your first member</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {members.map((member) => (
              <div key={member.id} className={styles.card}>
                {/* Photo */}
                <div className={styles.cardPhotoWrap}>
                  {member.photo
                    ? <img src={member.photo} alt={member.name} className={styles.cardPhoto} />
                    : <div className={styles.cardPhotoFallback}>{member.name?.[0] ?? '?'}</div>
                  }
                </div>

                {/* Info */}
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{member.name}</h3>
                  <p className={styles.cardPosition}>{member.position}</p>
                  <p className={styles.cardMeta}>{member.department} · {member.batch}</p>
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => downloadQR(member)}
                    disabled={qrLoading[member.id]}
                    title="Download QR Code"
                  >
                    {qrLoading[member.id] ? '…' : '⬇ QR'}
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => openEdit(member)}
                    title="Edit member"
                  >
                    ✏ Edit
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => setDeleteTarget(member)}
                    title="Delete member"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <MemberModal
          member={editingMember}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.confirmTitle}>Delete Member?</h3>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              Their photo will also be permanently removed from Cloudinary.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className={styles.deleteBtn}
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
