import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import styles from './ProfilePage.module.css';
import logo from '../assets/logo_bg_removed.png';
import akhilImage from '../assets/Akhil_S_Krishna-SIGHT_Vice_Chair.jpg';
import { FaArrowRight } from 'react-icons/fa';

const SOCIAL_LINKS = {
  linkedin: { href: (v) => v, label: 'LINKEDIN' },
  instagram:{ href: (v) => v, label: 'INSTAGRAM' },
  github:   { href: (v) => v, label: 'GITHUB' },
  email:    { href: (v) => `mailto:${v}`, label: 'EMAIL' },
  phone:    { href: (v) => `tel:${v}`, label: 'PHONE' },
  snapchat: { href: (v) => `https://snapchat.com/add/${v}`, label: 'SNAPCHAT' },
};

export default function ProfilePage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // TEMPORARY: For previewing 'test-id-123'
    if (id === 'test-id-123') {
      setMember({
        id: 'test-id-123',
        name: 'Akhil S Krishna',
        position: 'SIGHT Vice Chair',
        department: 'Computer Science',
        batch: '2024 - 2028',
        photo: akhilImage,
        socials: {
          linkedin: 'https://linkedin.com/',
          github: 'https://github.com/',
          email: 'user@example.com'
        }
      });
      setStatus('found');
      return;
    }

    const fetchMember = async () => {
      try {
        const res = await api.get(`/api/members/${id}`);
        setMember(res.data);
        setStatus('found');
      } catch (err) {
        if (err.response?.status === 404) {
          setStatus('notfound');
        } else {
          setStatus('error');
        }
      }
    };
    fetchMember();
  }, [id]);

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonPhotoArea} />
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonLine} style={{ width: '60%', height: '28px' }} />
            <div className={styles.skeletonLine} style={{ width: '40%', height: '16px', marginTop: '10px' }} />
            <div className={styles.skeletonLine} style={{ width: '50%', height: '13px', marginTop: '8px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <img src={logo} alt="IEEE SB CECTL" className={styles.logoImg} />
          </div>
          <div className={styles.stateContent}>
            <div className={styles.stateIcon}>🔍</div>
            <h2 className={styles.stateTitle}>Member Not Found</h2>
            <p className={styles.stateText}>
              This QR code may belong to a member who has been removed, or the link is incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.topBar}>
            <img src={logo} alt="IEEE SB CECTL" className={styles.logoImg} />
          </div>
          <div className={styles.stateContent}>
            <div className={styles.stateIcon}>⚠️</div>
            <h2 className={styles.stateTitle}>Something Went Wrong</h2>
            <p className={styles.stateText}>Unable to load profile. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const socialEntries = Object.entries(member.socials || {}).filter(
    ([key, value]) => value && SOCIAL_LINKS[key]
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Background Elements ── */}
        <div className={styles.bgBase} />
        <div className={styles.bgPattern} />
        <div className={styles.bgShape1} />
        <div className={styles.bgShape2} />
        <div className={styles.greenLine} />
        
        {/* Abstract watermark shape (the big arrow/circle in background) */}
        <div className={styles.watermark}>
          <div className={styles.watermarkDiamond}>
            <div className={styles.watermarkArrow} />
            <div className={styles.watermarkCircle} />
          </div>
        </div>

        {/* ── Header ── */}
        <div className={styles.topBar}>
          <img src={logo} alt="IEEE SB CECTL" className={styles.logoImg} />
          <div className={styles.ieeeLabel}>
            <span className={styles.ieeeIcon}>❖</span>
            <span className={styles.ieeeText}>IEEE</span>
          </div>
        </div>

        {/* ── Photo ── */}
        <div className={styles.photoWrap}>
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className={styles.photo}
            />
          ) : (
            <div className={styles.photoFallback}>
              {member.name ? member.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          {/* A gradient overlay at the bottom of the photo to blend it smoothly into the black background */}
          <div className={styles.photoGradient} />
        </div>

        {/* ── Info Panel ── */}
        <div className={styles.infoPanel}>
          <div className={styles.nameContainer}>
            <h1 className={styles.name}>{member.name}</h1>
          </div>
          
          <div className={styles.positionRow}>
            <p className={styles.position}>{member.position}</p>
          </div>

          {(member.department || member.batch) && (
            <p className={styles.department}>
              {member.department && (
                <span className={styles.departmentText}>{member.department}</span>
              )}
              {member.department && member.batch && (
                <span className={styles.separator}> · </span>
              )}
              {member.batch && (
                <span className={styles.batchText}>{member.batch}</span>
              )}
            </p>
          )}

          {/* ── Social links ── */}
          {socialEntries.length > 0 && (
            <div className={styles.socialsRow}>
              {socialEntries.map(([key, value]) => {
                const { href, label } = SOCIAL_LINKS[key];
                return (
                  <a
                    key={key}
                    href={href(value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialTextLink}
                  >
                    <span className={styles.socialText}>{label}</span>
                    <FaArrowRight size={10} className={styles.socialArrow} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
