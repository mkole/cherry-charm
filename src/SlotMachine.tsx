import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useGame from "./stores/store";
import segmentToFruit from "./utils/functions/segmentToFruit";
import { WHEEL_SEGMENT } from "./utils/constants";
import Reel from "./Reel";

interface ReelGroup extends THREE.Group {
  reelSegment?: number;
  reelPosition?: number;
  reelSpinUntil?: number;
  reelStopSegment?: number;
}

interface SlotMachineProps {
  value: (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[];
}

const SlotMachine = forwardRef(({ value }: SlotMachineProps, ref) => {
  const setFruit0 = useGame((state) => state.setFruit0);
  const setFruit1 = useGame((state) => state.setFruit1);
  const setFruit2 = useGame((state) => state.setFruit2);

  const reelRefs = [
    useRef<ReelGroup>(null),
    useRef<ReelGroup>(null),
    useRef<ReelGroup>(null),
  ];

  useEffect(() => {
    const getRandomStopSegment = () => Math.floor(Math.random() * 14); // Generates a random number between 0 and 7

    const spinReel = (reelIndex: number) => {
      const reel = reelRefs[reelIndex].current;
      if (reel) {
        const stopSegment = getRandomStopSegment();
        console.log(stopSegment);

        reel.reelSpinUntil = stopSegment;
      }
    };

    spinReel(0);
    spinReel(1);
    spinReel(2);
  }, []);

  useFrame(() => {
    for (let i = 0; i < reelRefs.length; i++) {
      const reel = reelRefs[i].current;
      if (reel) {
        if (reel.reelSpinUntil !== undefined) {
          if (reel.reelSegment === undefined) {
            reel.reelSegment = 0;
          }

          const targetRotationX =
            (reel.reelSpinUntil - reel.reelSegment) * WHEEL_SEGMENT;
          const rotationSpeed = 0.05;

          if (reel.rotation.x < targetRotationX) {
            reel.rotation.x += rotationSpeed;
            reel.reelSegment = Math.floor(reel.rotation.x / WHEEL_SEGMENT);
          } else if (reel.rotation.x >= targetRotationX) {
            // The reel ηασ stopped spinning at the desired segment
            const fruit = segmentToFruit(i, reel.reelSegment);

            if (fruit) {
              switch (i) {
                case 0:
                  setFruit0(fruit.toString());
                  break;
                case 1:
                  setFruit1(fruit.toString());
                  break;
                case 2:
                  setFruit2(fruit.toString());
                  break;
              }
            }

            console.log(
              `Reel ${i + 1} stopped at segment ${reel.reelSegment} ${fruit}`
            );
            reel.reelSpinUntil = undefined; // Reset reelSpinUntil to stop further logging
          }
        }
      }
    }
  });

  useImperativeHandle(ref, () => ({
    reelRefs,
  }));

  // useImperativeHandle(ref, () => ({
  //   reelRefs: reelRefs.map((ref) => ref.current),
  // }));

  return (
    <>
      <Reel
        ref={reelRefs[0]}
        value={value[0]}
        map={0}
        position={[-7, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[10, 10, 10]}
        reelSegment={0}
      />
      <Reel
        ref={reelRefs[1]}
        value={value[1]}
        map={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[10, 10, 10]}
        reelSegment={0}
      />
      <Reel
        ref={reelRefs[2]}
        value={value[2]}
        map={2}
        position={[7, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[10, 10, 10]}
        reelSegment={0}
      />
    </>
  );
});

export default SlotMachine;
