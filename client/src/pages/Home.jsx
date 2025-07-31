import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const endpoints = [
          '/api/listing/get?offer=true&limit=4',
          '/api/listing/get?type=rent&limit=4',
          '/api/listing/get?type=sale&limit=4',
        ];

        const responses = await Promise.all(endpoints.map(url => fetch(url)));

        const dataList = await Promise.all(
          responses.map(async (res, i) => {
            if (!res.ok) {
              console.error(`Error fetching ${endpoints[i]}: ${res.status}`);
              return [];
            }

            try {
              return await res.json();
            } catch (err) {
              console.error(`Failed to parse JSON from ${endpoints[i]}`, err);
              return [];
            }
          })
        );

        setOfferListings(dataList[0] || []);
        setRentListings(dataList[1] || []);
        setSaleListings(dataList[2] || []);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div>
      {/* Top Section */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-slate-500'>perfect</span>
          <br />
          place with ease
        </h1>
        <p className='text-gray-400 text-xs sm:text-sm'>
          Alcom Rental is the best place to find your next perfect place to live.
          <br />
          We have a wide range of properties for you to choose from.
        </p>
        <Link
          to='/search'
          className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'
        >
          Let’s get started...
        </Link>
      </div>

      {/* Swiper Section */}
      {offerListings.length > 0 && (
        <Swiper navigation modules={[Navigation]} className='w-full h-[500px]'>
          {offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                className='h-[500px] bg-center bg-no-repeat bg-cover'
                style={{
                  backgroundImage: `url(${listing.imageUrls?.[0] || '/default.jpg'})`,
                }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Listings Section */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {loading && <p className='text-center text-gray-500'>Loading listings...</p>}

        {/* Offers */}
        {!loading && offerListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Offers</h2>
              <Link to='/search?offer=true' className='text-sm text-blue-800 hover:underline'>
                Show more offers
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* Rent */}
        {!loading && rentListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Places for Rent</h2>
              <Link to='/search?type=rent' className='text-sm text-blue-800 hover:underline'>
                Show more places for rent
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* Sale */}
        {!loading && saleListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Places for Sale</h2>
              <Link to='/search?type=sale' className='text-sm text-blue-800 hover:underline'>
                Show more places for sale
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {saleListings.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
