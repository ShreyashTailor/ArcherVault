import VideoPlayer from '../VideoPlayer';

export default function VideoPlayerExample() {
  return (
    <div className="p-6 max-w-4xl">
      <VideoPlayer
        url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        title="Introduction to Algebra"
      />
    </div>
  );
}
