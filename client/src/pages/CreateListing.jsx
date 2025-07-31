import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const fileRef = useRef();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 1000,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    imageUrls: [],
  });

  // Upload image to Firebase
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const filename = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(resolve)
            .catch(reject);
        }
      );
    });
  };

  // Handle upload button click
  const handleImageUpload = async () => {
    if (!files.length) return;

    if (formData.imageUrls.length + files.length > 6) {
      return setImageUploadError('You can upload a maximum of 6 images.');
    }

    setUploading(true);
    setImageUploadError('');

    try {
      const uploadPromises = [...files].map((file) => storeImage(file));
      const urls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...urls],
      }));
    } catch (err) {
      console.error(err);
      setImageUploadError('Upload failed. Each file must be under 2MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else if (id === 'sell' || id === 'rent') {
      setFormData((prev) => ({ ...prev, type: id }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.imageUrls.length === 0) {
      return setError('Please upload at least one image.');
    }

    if (+formData.discountPrice >= +formData.regularPrice) {
      return setError('Discount price must be less than regular price.');
    }

    try {
      setLoading(true);

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to create listing.');
      }

      navigate(`/listing/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center mb-6'>Create Listing</h1>

      <form onSubmit={handleSubmit} className='flex flex-col md:flex-row gap-6'>
        {/* LEFT SECTION */}
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            id='name'
            placeholder='Name'
            required
            minLength='5'
            maxLength='62'
            value={formData.name}
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <textarea
            id='description'
            placeholder='Description'
            required
            value={formData.description}
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            type='text'
            id='address'
            placeholder='Address'
            required
            value={formData.address}
            onChange={handleChange}
            className='border p-3 rounded'
          />

          {/* Checkboxes */}
          <div className='flex flex-wrap gap-4'>
            {['sell', 'rent'].map((type) => (
              <label key={type} className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id={type}
                  checked={formData.type === type}
                  onChange={handleChange}
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
            {['parking', 'furnished', 'offer'].map((field) => (
              <label key={field} className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id={field}
                  checked={formData[field]}
                  onChange={handleChange}
                />
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            ))}
          </div>

          {/* Numeric Fields */}
          <div className='flex flex-wrap gap-4'>
            <input
              type='number'
              id='bedrooms'
              min='1'
              max='10'
              required
              className='border p-3 rounded w-24'
              value={formData.bedrooms}
              onChange={handleChange}
            />
            <input
              type='number'
              id='bathrooms'
              min='1'
              max='10'
              required
              className='border p-3 rounded w-24'
              value={formData.bathrooms}
              onChange={handleChange}
            />
            <input
              type='number'
              id='regularPrice'
              min='1000'
              required
              className='border p-3 rounded'
              value={formData.regularPrice}
              onChange={handleChange}
            />
            {formData.offer && (
              <input
                type='number'
                id='discountPrice'
                min='0'
                required
                className='border p-3 rounded'
                value={formData.discountPrice}
                onChange={handleChange}
              />
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className='flex flex-col gap-4 flex-1'>
          <p className='font-semibold'>
            Images:
            <span className='font-normal text-gray-600 ml-2'>
              (Max 6, each &lt; 2MB)
            </span>
          </p>

          <div className='flex gap-4'>
            <input
              type='file'
              accept='image/*'
              multiple
              onChange={(e) => setFiles(e.target.files)}
              ref={fileRef}
              className='border p-3 rounded w-full'
            />
            <button
              type='button'
              onClick={handleImageUpload}
              disabled={uploading}
              className='p-3 border border-green-600 text-green-600 rounded hover:bg-green-100 disabled:opacity-50'
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {imageUploadError && <p className='text-red-600'>{imageUploadError}</p>}

          {/* Image Preview */}
          {formData.imageUrls.map((url, index) => (
            <div key={url} className='flex items-center justify-between border p-2'>
              <img src={url} alt='upload' className='w-20 h-20 object-cover rounded' />
              <button
                type='button'
                onClick={() => handleDeleteImage(index)}
                className='text-red-500 hover:underline'
              >
                Delete
              </button>
            </div>
          ))}

          <button
            type='submit'
            disabled={loading || uploading}
            className='bg-blue-600 text-white p-3 rounded hover:opacity-90 disabled:opacity-50'
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          {error && <p className='text-red-600'>{error}</p>}
        </div>
      </form>
    </div>
  );
}
