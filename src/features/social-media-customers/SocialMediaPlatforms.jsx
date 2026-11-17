import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Pencil, Plus, Search, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { socialApi } from './api';
import PlatformIcon from './PlatformIcon';
import './workspace.css';

const cleanErr = e => e?.response?.data?.message || e.message || 'Unable to save platform';

export default function SocialMediaPlatforms() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [name, setName] = useState('');
  const [logoData, setLogoData] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = () =>
    socialApi.managePlatforms().then(setItems).catch(e => setError(cleanErr(e)));

  useEffect(() => {
    refresh();
  }, []);

  const open = (item = null) => {
    setModal(item || 'new');
    setName(item?.name || '');
    setLogoData(undefined);
    setError('');
  };

  const readLogo = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/webp'].includes(file.type) || file.size > 90000) {
      setError('Use PNG or WebP below 90 KB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoData(String(reader.result));
    reader.readAsDataURL(file);
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (modal === 'new') {
        await socialApi.addPlatform({ name, ...(logoData !== undefined ? { logoData } : {}) });
      } else {
        await socialApi.editPlatform(modal.id, { name, ...(logoData !== undefined ? { logoData } : {}) });
      }
      setModal(null);
      await refresh();
    } catch (err) {
      setError(cleanErr(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item) {
    try {
      await socialApi.editPlatform(item.id, { isActive: !item.isActive });
      await refresh();
    } catch (e) {
      setError(cleanErr(e));
    }
  }

  const filtered = useMemo(
    () => items.filter(x => x.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const activeCount = items.filter(x => x.isActive).length;
  const inactiveCount = items.length - activeCount;

  return (
    <main className="smw space-y-5 sm-platform-master-page">
      <div className="smw-crumb">
        <Link to="/admin/dashboard">Dashboard</Link>
        <ArrowRight size={13} />
        <Link to="/admin/social-media-customers">Social Media</Link>
        <ArrowRight size={13} />
        Platforms
      </div>

      <header className="smw-heading">
        <div className="smw-heading-left">
          <span className="smw-hero-icon">
            <Share2 size={27} />
          </span>
          <div>
            <h1>Social Media Platforms</h1>
            <p>Manage platform master records, logos and active availability for customer accounts.</p>
          </div>
        </div>
        <button className="smw-primary" onClick={() => open()}>
          <Plus size={19} /> Add Platform
        </button>
      </header>

      <section className="smw-stats sm-platform-master-stats">
        <div className="smw-stat smw-sky">
          <span className="smw-stat-icon">
            <Share2 size={23} />
          </span>
          <div>
            <p>Total platforms</p>
            <strong>{items.length}</strong>
            <small>Available in platform master</small>
          </div>
        </div>
        <div className="smw-stat smw-mint">
          <span className="smw-stat-icon">
            <Share2 size={23} />
          </span>
          <div>
            <p>Active platforms</p>
            <strong>{activeCount}</strong>
            <small>Usable in account forms</small>
          </div>
        </div>
        <div className="smw-stat smw-amber">
          <span className="smw-stat-icon">
            <Share2 size={23} />
          </span>
          <div>
            <p>Inactive platforms</p>
            <strong>{inactiveCount}</strong>
            <small>Hidden from new selection</small>
          </div>
        </div>
        <div className="smw-stat smw-violet">
          <span className="smw-stat-icon">
            <Search size={23} />
          </span>
          <div>
            <p>Search results</p>
            <strong>{filtered.length}</strong>
            <small>Matching current search</small>
          </div>
        </div>
      </section>

      <section className="smw-panel smw-filters" aria-label="Platform filters">
        <label className="smw-search">
          <Search size={19} />
          <input
            aria-label="Search platforms"
            placeholder="Search platforms by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <button className="smw-button" onClick={() => setSearch('')} disabled={!search}>
          Reset
        </button>
      </section>

      <section className="smw-panel smw-directory">
        <div className="smw-section-head">
          <div className="smw-section-title">
            <span className="smw-mini-icon">
              <Share2 size={21} />
            </span>
            <div>
              <h2>
                Platform Master <span>({filtered.length})</span>
              </h2>
              <p>Consistent platform registry used by the social media customer module</p>
            </div>
          </div>
        </div>

        {error && !modal && (
          <div className="smw-error" role="alert">
            {String(error)} <button onClick={refresh}>Retry</button>
          </div>
        )}

        <div className="smw-table-wrap">
          <table className="smw-table sm-platform-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Code</th>
                <th>Status</th>
                <th className="smw-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="smw-name-cell sm-platform-name-cell">
                      <span className="sm-platform-badge">
                        <PlatformIcon
                          platform={item.name}
                          logoData={item.logoData}
                          size={36}
                          className="sm-platform-badge-icon"
                        />
                      </span>
                      <div>
                        <span className="smw-customer-name sm-platform-name-text">{item.name}</span>
                        <small>{item.logoData ? 'Custom platform logo' : 'System platform icon'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="sm-platform-code">{item.code}</span>
                  </td>
                  <td>
                    <span className={`smw-status ${item.isActive ? 'is-active' : 'is-inactive'}`}>
                      <span />
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="smw-right">
                    <div className="smw-row-actions">
                      <button type="button" className="smw-outline-action" onClick={() => open(item)}>
                        <Pencil size={16} /> Edit
                      </button>
                      <button type="button" className="smw-outline-action" onClick={() => toggle(item)}>
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && <p className="smw-empty">No platforms match your current search.</p>}
      </section>

      {modal && (
        <div role="presentation" className="sm-master-modal-cover">
          <form
            className="sm-master-modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal === 'new' ? 'Add platform' : 'Edit platform'}
            onSubmit={save}
          >
            <h2 className="text-xl font-bold">{modal === 'new' ? 'Add Platform' : 'Edit Platform'}</h2>
            <p className="sm-master-subtitle">
              Keep platform identity clean and consistent so customer forms and tables remain uniform.
            </p>
            <label>
              Platform Name *
              <input required maxLength={100} value={name} onChange={e => setName(e.target.value)} />
            </label>
            <label>
              Custom logo (optional PNG/WebP, max 90 KB)
              <input type="file" accept="image/png,image/webp" onChange={readLogo} />
            </label>
            <div className="sm-master-logo-row">
              <span className="sm-platform-badge sm-platform-badge-preview">
                <PlatformIcon
                  platform={name}
                  logoData={logoData === undefined ? modal?.logoData : logoData}
                  size={48}
                  className="sm-platform-badge-icon"
                />
              </span>
              <div>
                <strong className="block">Logo preview</strong>
                <small className="text-slate-500">The same icon will be used in platform master and account views.</small>
              </div>
              {modal !== 'new' && (
                <button type="button" className="smw-button" onClick={() => setLogoData('')}>
                  Remove logo
                </button>
              )}
            </div>
            {error && <p role="alert" className="text-red-600">{String(error)}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)}>Cancel</button>
              <button disabled={busy} className="sm-master-action">
                {busy ? 'Saving…' : 'Save Platform'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
