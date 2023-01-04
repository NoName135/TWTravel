import MoonLoader from 'react-spinners/MoonLoader';
import PropagateLoader from 'react-spinners/PropagateLoader';
import PuffLoader from 'react-spinners/PuffLoader';
import CircleLoader from 'react-spinners/CircleLoader';
import FadeLoader from 'react-spinners/FadeLoader';
import PulseLoader from 'react-spinners/PulseLoader';
import ClockLoader from 'react-spinners/ClockLoader';
import BeatLoader from 'react-spinners/BeatLoader';
import ScaleLoader from 'react-spinners/ScaleLoader';

const LoginLoader = () => {
  return (
    <div className="position-absolute d-flex justify-content-center align-items-center"
      style={{background: 'rgba(0, 0, 0, 0.5)', top: '0', left: '0', right: '0', bottom: '0'}}>
      <div>
        <MoonLoader
          color="#EFF4E5"
          cssOverride={{}}
          loading
          size={60}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  );
};

const ListLoader = () => {
  return (
    <div className="position-absolute d-flex justify-content-center rounded"
      style={{zIndex: '1100', background: 'rgba(0, 0, 0, 0.5)', top: '35px', left: '-30px', right: '-30px', bottom: '-30px'}}>
      <div style={{marginTop: '-60px'}}>
        <PropagateLoader
          color="#5C9500"
          cssOverride={{}}
          loading
          size={20}
          speedMultiplier={2}
        />
      </div>
    </div>
  );
};


const ListStarLoader = (props) => {
  const {listStarLoading, id} = props;
  // console.log(listStarLoading, id)
  return (
    <>
      <PuffLoader
        className={`position-absolute top-0 end-0 m-3
          ${listStarLoading.length > 0 && listStarLoading.indexOf(id) > -1 ? 'd-block' : 'd-none'
        }`}
        color="#5C9500"
        cssOverride={{}}
        loading
        size={35}
        speedMultiplier={2}
      />
    </>
  );
}

const DetailLoader = () => {
  return (
    <div className="position-absolute d-flex justify-content-center rounded"
      style={{zIndex: '1100', background: 'rgba(0, 0, 0, 0.5)', top: '90px', left: '-30px', right: '-30px', bottom: '-30px'}}>
      <div style={{marginTop: '45px'}}>
        <CircleLoader
          color="#EFF4E5"
          cssOverride={{}}
          loading
          size={80}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  );
};

const DetailStarLoader = () => {
  return (
    <>
      <PuffLoader
        className=""
        color="#5C9500"
        cssOverride={{}}
        loading
        size={35}
        speedMultiplier={2}
      />
    </>
  );
};

const PhotoLoader = () => {
  return (
    <div
      className="position-absolute d-flex justify-content-center align-items-center rounded-circle"
      style={{ background: 'rgba(0, 0, 0, 0.5)', top: '0', left: '0', right: '0', bottom: '0' }}
    >
      <div>
        <FadeLoader
          color="#EFF4E5"
          speedMultiplier={1.5}
          margin={9}
          width={7}
        />
      </div>
    </div>
  );
}

const UserLoader = () => {
  return (
    <div className="position-absolute d-flex justify-content-center align-items-center rounded"
      style={{top: '-20px', left: '0', right: '0', bottom: '0', marginTop: '60px'}}>
      <div>
        <MoonLoader
          color="#5C9500"
          cssOverride={{}}
          loading
          size={60}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  );
};

const CreateLoader = () => {
  return (
    <div
      className="position-absolute d-flex justify-content-center align-items-center rounded"
      style={{ top: '5px', left: '0', right: '0', bottom: '0' }}
    >
      <div>
        <PulseLoader
          color="#EFF4E5"
          margin={8}
          size={10}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  );
}

const ItineraryLoader = () => {
  return (
    <div
      className="position-absolute d-flex justify-content-center align-items-center rounded"
      style={{zIndex: '1100', background: 'rgba(0, 0, 0, 0.5)', top: '0', left: '0', right: '0', bottom: '0' }}
    >
      <div>
        <ClockLoader
          color="#EFF4E5"
          size={100}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  )
}

const DayLoader = () => {
  return (
    <div
      className="position-absolute d-flex justify-content-center align-items-center"
      style={{background: 'rgba(0, 0, 0, 0.5)', top: '0', left: '0', right: '0', bottom: '0' }}
    >
      <div>
        <BeatLoader
          color="#EFF4E5"
          margin={5}
          size={15}
          speedMultiplier={1.5}
        />
      </div>
    </div>
  )
}

const VehicleLoader = () => {
  return (
    <div
      className="position-absolute d-flex justify-content-center align-items-center rounded"
      style={{background: 'rgba(0, 0, 0, 0.5)', top: '0', left: '0', right: '0', bottom: '0' }}
    >
      <div>
        <ScaleLoader
          color="#EFF4E5"
          height={35}
          margin={3}
          speedMultiplier={1.5}
          width={5}
        />
      </div>
    </div>
  )
}

const CustomPictureLoader = () => {
  return (
    <div
      className="position-absolute d-flex justify-content-center align-items-center rounded"
      style={{ background: 'rgba(0, 0, 0, 0.5)', top: '0', left: '0', right: '0', bottom: '0' }}
    >
      <div>
        <FadeLoader
          color="#EFF4E5"
          speedMultiplier={1.5}
          margin={9}
          width={7}
        />
      </div>
    </div>
  );
}

export {
  LoginLoader,
  ListLoader,
  ListStarLoader,
  DetailLoader,
  DetailStarLoader,
  PhotoLoader,
  UserLoader,
  CreateLoader,
  ItineraryLoader,
  DayLoader,
  VehicleLoader,
  CustomPictureLoader,
};