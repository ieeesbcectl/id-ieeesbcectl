import { useState, useEffect, useRef } from 'react';
import styles from './MemberModal.module.css';

const SOCIAL_FIELDS = [
  { key: 'email', label: 'Email', placeholder: 'name@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '+91 00000 00000' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'snapchat', label: 'Snapchat', placeholder: 'username' },
];

export default function MemberModal({ member, onClose, onSave }) {
  const isEdit = !!member;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    position: '',
    department: '',
    batch: '',
    socials: { email: '', phone: '', linkedin: '', github: '', instagram: '', snapchat: '' },
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        position: member.position || '',
        department: member.department || '',
        batch: member.batch || '',
        socials: {
          email: member.socials?.email || '',
          phone: member.socials?.phone || '',
          linkedin: member.socials?.linkedin || '',
          github: member.socials?.github || '',
          instagram: member.socials?.instagram || '',
          snapchat: member.socials?.snapchat || '',
        },
      });
      if (member.photo) setPhotoPreview(member.photo);
    }
  }, [member]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e) => {
    setForm({ ...form, socials: { ...form.socials, [e.target.name]: e.target.value } });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Build multipart FormData — backend expects this
    const data = new FormData();
    data.append('name', form.name);
    data.append('position', form.position);
    data.append('department', form.department);
    data.append('batch', form.batch);
    // Socials as JSON string (backend handles parsing)
    data.append('socials', JSON.stringify(form.socials));
    if (photoFile) {
      data.append('photo', photoFile);
    }

    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit Member' : 'Add New Member'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Photo upload */}
          <div className={styles.photoSection}>
            <div
              className={styles.photoPreview}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className={styles.previewImg} />
                : <span className={styles.photoPlaceholder}>Click to upload photo</span>
              }
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className={styles.hiddenInput}
            />
            <p className={styles.photoHint}>Profile Picture &#x2022; Upload in AVIF format</p>
          </div>

          {/* Core fields */}
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={styles.input} placeholder="e.g. John Doe" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Position *</label>
              <input name="position" value={form.position} onChange={handleChange} required className={styles.input} placeholder="e.g. Chairperson" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Department *</label>
              <input name="department" value={form.department} onChange={handleChange} required className={styles.input} placeholder="e.g. Computer Science" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Batch *</label>
              <input name="batch" value={form.batch} onChange={handleChange} required className={styles.input} placeholder="e.g. 2023 - 2027" />
            </div>
          </div>

          {/* Social links */}
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Social Links <span>(leave blank to hide)</span></p>
            <div className={styles.grid}>
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <div className={styles.field} key={key}>
                  <label className={styles.label}>{label}</label>
                  <input
                    name={key}
                    value={form.socials[key]}
                    onChange={handleSocialChange}
                    className={styles.input}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
