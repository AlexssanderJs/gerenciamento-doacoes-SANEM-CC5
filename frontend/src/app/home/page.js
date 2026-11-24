import MenuBar from '../components/menubar/menubar';
import Link from 'next/link';
import Navigation from '../components/navegation/navegation';
import styles from './home.module.css';
import { FaQuestionCircle } from 'react-icons/fa';
import HomeDemandsCard from '../../components/demands/HomeDemandsCard';
import HomeFlowChart from '../../components/home/HomeFlowChart';

export default function Home() {
  // Simulação: troque para true/false para testar
  const hasNotification = true;

  return (
    <div className={styles.container}>
      <Navigation />
      <MenuBar hasNotification={hasNotification} />
      <main className={styles.main}>
        <h1 className={styles.title}>Bem-vindo à Sanem!</h1>
        <p className={styles.effectPhrase}>
          "A solidariedade transforma vidas. Doe hoje e faça a diferença!"
        </p>
        <Link href="/ajuda" className={styles.helpButton}>
          <FaQuestionCircle />
          <span>Ajuda</span>
        </Link>
        <div className={styles.dashboards}>
          <HomeDemandsCard />
          <HomeFlowChart />
        </div>
      </main>
    </div>
  );
} 