import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from '../redux/user/userSlice';

export default function Profile() {
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [listings, setListings] = useState([]);
  const [listingError, setListingError] = useState(false);

  // Pre-fill formData from currentUser
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  // Upload image to Firebase
  useEffect(() => {
    if (file) uploadImage(file);
  }, [file]);

  const uploadImage = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size should be less than 2MB');
      return;
    }

    const storage = getStorage(app);
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadError('');
    setUploadProgress(0);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (err) => {
        console.error(err);
        setUploadError('Upload failed');
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData((prev) => ({ ...prev, avatar: downloadURL }));
        fileInputRef.current.value = '';
      }
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
    const payload = { ...formData };
    if (!payload.password) delete payload.password;

    try {
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;
    dispatch(deleteUserStart());
    try {
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      dispatch(deleteUserSuccess());
      navigate('/signin');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
  dispatch(signOutUserStart());
  try {
    const res = await fetch('/api/auth/signout', {
      credentials: 'include', 
    });
    if (!res.ok) throw new Error('Sign out failed');
    dispatch(signOutUserSuccess());
    navigate('/signin');
  } catch (err) {
    dispatch(signOutUserFailure(err.message));
  }
};



  const fetchUserListings = async () => {
    try {
      setListingError(false);
      const res = await fetch(`/api/listings?userId=${currentUser._id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setListings(data);
    } catch (err) {
      console.error(err);
      setListingError(true);
    }
  };

  const handleDeleteListing = async (id) => {
    try {
      const res = await fetch(`/api/listing/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setListings((prev) => prev.filter((listing) => listing._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>

      <form onSubmit={handleFormSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          accept='image/*'
          hidden
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <img
          src={formData.avatar || '/default-avatar.png'}
          alt='avatar'
          className='rounded-full h-24 w-24 object-cover self-center cursor-pointer mt-2'
          onClick={() => fileInputRef.current.click()}
        />

        {uploadError && <p className='text-sm text-center text-red-700'>{uploadError}</p>}
        {!uploadError && uploadProgress > 0 && uploadProgress < 100 && (
          <p className='text-sm text-center text-slate-700'>Uploading {uploadProgress}%</p>
        )}
        {uploadProgress === 100 && (
          <p className='text-sm text-center text-green-700'>Upload complete</p>
        )}

        <input
          id='username'
          type='text'
          value={formData.username || ''}
          onChange={handleInputChange}
          placeholder='Username'
          className='border p-3 rounded-lg'
          required
        />
        <input
          id='email'
          type='email'
          value={formData.email || ''}
          onChange={handleInputChange}
          placeholder='Email'
          className='border p-3 rounded-lg'
          required
        />
        <input
          id='password'
          type='password'
          onChange={handleInputChange}
          placeholder='New password (optional)'
          className='border p-3 rounded-lg'
        />

        <button
          type='submit'
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Updating...' : 'Update'}
        </button>

        <Link
          to='/create-listing'
          className='bg-green-700 text-white p-3 rounded-lg text-center uppercase hover:opacity-95'
        >
          Create Listing
        </Link>
      </form>

      <div className='flex justify-between mt-5 text-sm'>
        <span onClick={handleDeleteAccount} className='text-red-700 cursor-pointer'>
          Delete Account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign Out
        </span>
      </div>

      {error && <p className='text-red-700 mt-4'>{error}</p>}
      {updateSuccess && <p className='text-green-700 mt-4'>Profile updated successfully!</p>}

      <button
        onClick={fetchUserListings}
        className='text-green-700 w-full text-center mt-6 underline'
      >
        Show Listings
      </button>

      {listingError && <p className='text-red-700 mt-2'>Failed to fetch listings.</p>}
      {!listingError && listings.length === 0 && (
        <p className='text-center text-gray-600 mt-3'>No listings found.</p>
      )}

      {listings.length > 0 && (
        <div className='mt-6'>
          <h2 className='text-xl font-semibold text-center mb-4'>Your Listings</h2>
          <div className='flex flex-col gap-4'>
            {listings.map((listing) => (
              <div key={listing._id} className='flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50'>
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls?.[0] || '/no-image.png'}
                    alt='Listing'
                    className='h-16 w-16 object-cover rounded'
                  />
                </Link>
                <Link
                  to={`/listing/${listing._id}`}
                  className='flex-1 mx-2 font-semibold text-slate-700 hover:underline truncate'
                >
                  {listing.name}
                </Link>
                <div className='flex flex-col gap-1 items-end'>
                  <button
                    onClick={() => handleDeleteListing(listing._id)}
                    className='text-red-700 uppercase text-xs'
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-green-700 uppercase text-xs'>
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
